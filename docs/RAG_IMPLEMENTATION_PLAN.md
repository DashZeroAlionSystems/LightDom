# LightDom Ollama RAG Implementation Plan

## Executive Summary

This document outlines a phased approach to fix and simplify the RAG (Retrieval-Augmented Generation) system in LightDom. The current implementation has multiple overlapping services causing confusion and maintenance issues. This plan consolidates everything into a single, clean implementation.

## Current Issues Identified

### 1. Multiple Overlapping RAG Services
- `rag-service.js` - Basic RAG service
- `unified-rag-service.js` - 76KB "unified" service with excessive complexity
- `enhanced-rag-service.js` - Another enhanced variant
- `rag-standalone-service.js` - Standalone Express wrapper
- `rag-router.js` - Router with its own logic

### 2. Inconsistent Configuration
- Multiple places to configure embedding models
- Different env variable names used (OLLAMA_ENDPOINT, OLLAMA_API_URL, OLLAMA_BASE_URL)
- No single source of truth for RAG settings

### 3. Missing Database Integration
- Query history not being saved
- Embeddings not properly stored in pgvector
- No tracking of RAG interactions

### 4. MCP Integration Issues
- MCP server exists but not connected to RAG
- Tools defined but not integrated with Ollama model
- No function/tool calling enabled

---

## Phase 1: Simplify RAG Architecture (Foundation)

### Goal
Create a single, clean RAG service that:
- Works with Ollama out of the box
- Uses pgvector for vector storage
- Saves all interactions to database

### Files to Create/Modify

#### 1. `services/rag/simple-rag-service.js` (NEW - Primary Service)
A clean, minimal RAG implementation with:
- Document indexing with chunking
- Embedding via Ollama
- Vector search via pgvector
- Chat with context augmentation
- Full database logging

#### 2. Update `config/ollama/rag-config.json`
Consolidate all RAG configuration into one source of truth

#### 3. Database Migration
Ensure tables exist:
- `rag_documents` - Document chunks with embeddings
- `rag_query_log` - All queries with context and responses
- `rag_sessions` - Chat sessions

### API Endpoints
```
POST /api/rag/index     - Index documents
POST /api/rag/chat      - RAG chat with context
POST /api/rag/search    - Vector search only
GET  /api/rag/health    - Health check
GET  /api/rag/stats     - Usage statistics
```

---

## Phase 2: Database Integration

### Goal
Ensure all RAG activity is tracked and stored

### Tables Required

```sql
-- Document storage with embeddings
CREATE TABLE rag_documents (
    id SERIAL PRIMARY KEY,
    doc_id TEXT NOT NULL,
    namespace TEXT DEFAULT 'default',
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query/Response logging
CREATE TABLE rag_query_log (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    query TEXT NOT NULL,
    context_docs TEXT[],
    response TEXT,
    model_used TEXT,
    retrieval_time_ms INTEGER,
    generation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE rag_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    namespace TEXT DEFAULT 'default',
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 3: MCP + Ollama Tool Calling Integration

### Goal
Enable Ollama to call functions via MCP

### Components

#### 1. Update `mcp-config.json`
Add RAG tools to MCP server configuration

#### 2. Create RAG MCP Tools
```javascript
// Tools for Ollama to call
{
  name: 'rag_search',
  description: 'Search documents for relevant context',
  parameters: { query: 'string', topK: 'number' }
}

{
  name: 'rag_index',
  description: 'Index a document into the RAG system',
  parameters: { content: 'string', metadata: 'object' }
}
```

#### 3. Update Modelfile
Add tool calling configuration to Modelfile.lightdom-deepseek

---

## Phase 4: Testing & Validation

### Test Cases

1. **Index Document Test**
   - Index a sample document
   - Verify chunks created in database
   - Verify embeddings stored

2. **Search Test**
   - Search for content
   - Verify relevant chunks returned
   - Verify scores are reasonable

3. **Chat Test**
   - Ask question related to indexed content
   - Verify context is retrieved
   - Verify response uses context

4. **MCP Tool Test**
   - Trigger tool call from Ollama
   - Verify tool executes
   - Verify response returned

---

## Implementation Order

### Week 1: Core RAG
1. ✅ Create `simple-rag-service.js`
2. ✅ Create database migration
3. ✅ Create RAG API routes
4. ✅ Test document indexing

### Week 2: Database + Logging
1. ✅ Implement query logging
2. ✅ Implement session management
3. ✅ Add statistics endpoint
4. ✅ Test full flow

### Week 3: MCP Integration
1. ✅ Add RAG tools to MCP registry
2. ✅ Update Modelfile for tool calling
3. ✅ Test tool calling flow
4. ✅ Documentation

---

## Files to Remove/Deprecate

After new implementation is stable:

1. `services/rag/unified-rag-service.js` - Too complex
2. `services/rag/enhanced-rag-service.js` - Redundant
3. `api/enhanced-rag-routes.js` - Use simple routes
4. `api/unified-rag-routes.js` - Consolidate into main

Keep:
- `services/rag/rag-service.js` - Base (can rename to legacy)
- `services/rag/vector-store.js` - Still useful

---

## Success Criteria

1. **RAG Chat Works**
   - User can chat with context from indexed documents
   - Response is relevant and uses context

2. **All Data Saved**
   - Documents stored in PostgreSQL with pgvector
   - All queries logged
   - Sessions tracked

3. **MCP Tools Work**
   - Ollama can call RAG tools
   - Tools execute and return results

4. **Simple to Maintain**
   - Single service file
   - Clear configuration
   - Good documentation

---

## Configuration Reference

### Environment Variables
```bash
# Ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=lightdom-deepseek
EMBEDDING_MODEL=nomic-embed-text

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# RAG Settings
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_TOP_K=5
RAG_MIN_SCORE=0.6
```

### Default Models
- **LLM**: `lightdom-deepseek` (based on deepseek-r1:14b)
- **Embeddings**: `nomic-embed-text` (768 dimensions)

---

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Test incrementally
4. Document as we go

**Document Version**: 1.0.0
**Created**: 2025-12-02
**Author**: LightDom Development Team
