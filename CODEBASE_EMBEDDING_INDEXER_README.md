# Codebase Embedding & Indexing System

This document describes the codebase embedding and indexing system that uses **mxbai-embed-large** for the highest quality semantic search capabilities.

## Overview

The system provides:
- **High-quality embeddings** using `mxbai-embed-large` (1024 dimensions)
- **Model switching** for different use cases
- **Semantic search** across your entire codebase
- **Context retrieval** for AI models
- **Incremental indexing** for efficient updates
- **Export/import** for sharing indexes

## Quick Start

### 1. Index Your Codebase

```bash
# Using the CLI
node codebase-index-cli.js index

# Or index a specific directory
node codebase-index-cli.js index /path/to/project
```

### 2. Search Your Codebase

```bash
# Search for code
node codebase-index-cli.js search "user authentication"

# Get context for AI
node codebase-index-cli.js context "how does error handling work"
```

### 3. Via API

```bash
# Build the index
curl -X POST http://localhost:3001/api/codebase-index/build

# Search
curl "http://localhost:3001/api/codebase-index/search?q=authentication"

# Get context
curl "http://localhost:3001/api/codebase-index/context?q=error+handling"
```

## Embedding Models

### Available Models

| Model | Dimensions | Performance | Use Case |
|-------|------------|-------------|----------|
| **mxbai-embed-large** ⭐ | 1024 | Slower | Highest quality, precise semantic search |
| nomic-embed-text | 768 | Fast | General purpose |
| all-minilm | 384 | Fastest | Resource-constrained environments |
| snowflake-arctic-embed | 1024 | Medium | Enterprise applications |

### Recommended Model: mxbai-embed-large

For codebase indexing, we recommend `mxbai-embed-large` because:
- Highest embedding quality for precise semantic matching
- Better understanding of code semantics
- More accurate search results
- Better context for AI models

### Switching Models

```bash
# CLI
node codebase-index-cli.js switch nomic-embed-text

# API
curl -X POST http://localhost:3001/api/codebase-index/model \
  -H "Content-Type: application/json" \
  -d '{"model": "nomic-embed-text", "reindex": true}'
```

## API Endpoints

### Build Index
```
POST /api/codebase-index/build
{
  "incremental": false,
  "patterns": ["**/*.ts", "**/*.js"]
}
```

### Search
```
GET /api/codebase-index/search?q=<query>&topK=10&threshold=0.5
POST /api/codebase-index/search
{
  "query": "authentication flow",
  "topK": 10,
  "threshold": 0.5,
  "fileTypes": ["typescript", "javascript"]
}
```

### Get Context (for AI)
```
GET /api/codebase-index/context?q=<query>&maxTokens=4000
POST /api/codebase-index/context
{
  "query": "how does the API handle errors",
  "maxTokens": 4000,
  "topK": 5
}
```

### Find Similar Files
```
GET /api/codebase-index/similar?file=<path>&topK=5
```

### Find Related Code
```
POST /api/codebase-index/related
{
  "code": "const user = await db.findUser(id);",
  "topK": 5,
  "excludeFile": "src/user.ts"
}
```

### Statistics
```
GET /api/codebase-index/stats
GET /api/codebase-index/files
GET /api/codebase-index/health
```

### Model Management
```
GET /api/codebase-index/models
POST /api/codebase-index/model
{
  "model": "nomic-embed-text",
  "reindex": false,
  "pullIfMissing": true
}
```

### Export/Import
```
POST /api/codebase-index/export
{
  "outputPath": "./codebase-index-export.json"
}

POST /api/codebase-index/import
{
  "inputPath": "./codebase-index-export.json"
}
```

### Clear Index
```
DELETE /api/codebase-index
```

## CLI Commands

```bash
# Index codebase
codebase-index-cli index [path]
codebase-index-cli index --incremental  # Only index changes

# Search
codebase-index-cli search "query"
codebase-index-cli search "query" --topk 20 --threshold 0.3

# Get AI context
codebase-index-cli context "query"

# Find similar files
codebase-index-cli similar src/components/Auth.tsx

# Find related code
codebase-index-cli related "async function fetchUser"

# Statistics
codebase-index-cli stats
codebase-index-cli files

# Model management
codebase-index-cli models
codebase-index-cli switch nomic-embed-text

# Export/Import
codebase-index-cli export ./index.json
codebase-index-cli import ./index.json

# Clear
codebase-index-cli clear
```

## Integration with AI Models

### Getting Context for Prompts

The `getContext` function returns relevant code snippets that can be used as context for AI models:

```javascript
import { createCodebaseEmbeddingIndexer } from './services/rag/codebase-embedding-indexer.js';

const indexer = createCodebaseEmbeddingIndexer({
  rootPath: '/path/to/project',
  model: 'mxbai-embed-large',
});

await indexer.initialize();

// Get context for an AI query
const context = await indexer.getContext("how does authentication work", {
  maxTokens: 4000,
  topK: 5,
});

// Use with your AI model
const prompt = `
Based on the following codebase context:

${context.context}

Answer the question: How does authentication work in this project?
`;
```

### Sharing Index Between Models

The index can be exported and imported, allowing you to:
1. Build the index once
2. Export it
3. Share with other models or team members
4. Import on different machines

```javascript
// Export
await indexer.exportIndex('./codebase-index.json');

// Import on another machine
await indexer.importIndex('./codebase-index.json');
```

## Model Profiles in Ollama CLI

The Ollama CLI now supports model profiles:

```bash
# Switch to code profile (deepseek-coder:33b)
ollama-cli /profile code

# Switch to embedding profile (mxbai-embed-large)
ollama-cli /profile embedding

# Switch embedding model directly
ollama-cli /embedding mxbai-embed-large

# View current config
ollama-cli /config
```

## Configuration

### Environment Variables

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
EMBEDDING_MODEL=mxbai-embed-large
```

### ollama-cli-config.json

```json
{
  "currentModel": "llama2:7b",
  "embeddingModel": "mxbai-embed-large",
  "modelProfiles": {
    "chat": { "default": "llama2:7b" },
    "code": { "default": "deepseek-coder:33b" },
    "embedding": { "default": "mxbai-embed-large" }
  }
}
```

## Performance Tips

1. **Use incremental indexing** for large codebases after initial index
2. **Adjust chunk size** based on your code structure
3. **Use file type filters** when searching specific areas
4. **Cache embeddings** for frequently queried content
5. **Export/import** indexes instead of regenerating

## Troubleshooting

### Model Not Found
```bash
# Pull the model manually
ollama pull mxbai-embed-large
```

### Slow Indexing
```bash
# Use a faster model for initial testing
node codebase-index-cli.js index --model nomic-embed-text
```

### Out of Memory
- Reduce `maxFileSize` in config
- Index in smaller batches
- Use `all-minilm` for lower memory usage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Codebase Indexer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   File       │───▶│   Chunk      │───▶│  Embedding   │   │
│  │   Scanner    │    │   Generator  │    │   Service    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                    │         │
│                                                    ▼         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Vector Index                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │   │
│  │  │  Chunks  │  │Embeddings│  │  Metadata        │    │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Search & Query                      │   │
│  │  • Semantic Search  • Context Retrieval              │   │
│  │  • Similar Files    • Related Code                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Ollama Service                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  mxbai-embed-large | nomic-embed-text | all-minilm    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Related Files

- `services/rag/ollama-embedding-service.js` - Embedding service with model switching
- `services/rag/codebase-embedding-indexer.js` - Main indexing engine
- `api/codebase-embedding-routes.js` - API routes
- `codebase-index-cli.js` - CLI tool
- `ollama-cli.js` - Updated with model profiles
- `ollama-cli-config.json` - Configuration with embedding models
