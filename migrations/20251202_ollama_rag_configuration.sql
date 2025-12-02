-- Migration: Ollama RAG Configuration System
-- Created: 2025-12-02
-- Description: Creates tables for managing Ollama model configurations, RAG settings,
--              and embedding parameters that can be stored and applied from the database

-- ============================================================================
-- TABLE: ollama_model_configs
-- Stores Modelfile configurations that can be applied to create custom models
-- ============================================================================
CREATE TABLE IF NOT EXISTS ollama_model_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Base model settings
    base_model VARCHAR(255) NOT NULL DEFAULT 'deepseek-r1:14b',
    
    -- Generation parameters (Modelfile PARAMETER directives)
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    top_p DECIMAL(3,2) DEFAULT 0.9 CHECK (top_p >= 0 AND top_p <= 1),
    top_k INTEGER DEFAULT 40 CHECK (top_k >= 1 AND top_k <= 100),
    repeat_penalty DECIMAL(3,2) DEFAULT 1.1 CHECK (repeat_penalty >= 0 AND repeat_penalty <= 2),
    repeat_last_n INTEGER DEFAULT 64,
    
    -- Context parameters
    num_ctx INTEGER DEFAULT 16384 CHECK (num_ctx >= 512 AND num_ctx <= 131072),
    num_predict INTEGER DEFAULT -1,
    num_batch INTEGER DEFAULT 512,
    num_keep INTEGER DEFAULT 0,
    
    -- Mirostat perplexity control
    mirostat INTEGER DEFAULT 2 CHECK (mirostat >= 0 AND mirostat <= 2),
    mirostat_eta DECIMAL(4,3) DEFAULT 0.1,
    mirostat_tau DECIMAL(4,2) DEFAULT 5.0,
    
    -- Stop sequences (stored as JSON array)
    stop_sequences JSONB DEFAULT '["<|im_end|>", "</s>"]'::jsonb,
    
    -- System prompt (SYSTEM directive)
    system_prompt TEXT,
    
    -- Template (TEMPLATE directive)
    template TEXT,
    
    -- License text (LICENSE directive)
    license_text TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional config stored as JSON for flexibility
    additional_config JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLE: ollama_rag_configs
-- Stores RAG-specific configurations for document processing and retrieval
-- ============================================================================
CREATE TABLE IF NOT EXISTS ollama_rag_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Associated model config
    model_config_id INTEGER REFERENCES ollama_model_configs(id) ON DELETE SET NULL,
    
    -- Embedding configuration
    embedding_model VARCHAR(255) DEFAULT 'nomic-embed-text',
    embedding_dimension INTEGER DEFAULT 768,
    embedding_provider VARCHAR(50) DEFAULT 'ollama', -- 'ollama', 'openai', 'huggingface'
    
    -- Document processing settings
    chunk_size INTEGER DEFAULT 1000 CHECK (chunk_size >= 100 AND chunk_size <= 10000),
    chunk_overlap INTEGER DEFAULT 200 CHECK (chunk_overlap >= 0),
    preserve_structure BOOLEAN DEFAULT true,
    extract_metadata BOOLEAN DEFAULT true,
    
    -- Supported formats (JSON array)
    supported_formats JSONB DEFAULT '["text", "markdown", "code", "json", "html", "pdf"]'::jsonb,
    
    -- Vector store settings
    vector_table_name VARCHAR(255) DEFAULT 'rag_documents',
    top_k INTEGER DEFAULT 5 CHECK (top_k >= 1 AND top_k <= 100),
    min_score DECIMAL(3,2) DEFAULT 0.6 CHECK (min_score >= 0 AND min_score <= 1),
    
    -- Hybrid search settings
    hybrid_search_enabled BOOLEAN DEFAULT true,
    semantic_weight DECIMAL(3,2) DEFAULT 0.7 CHECK (semantic_weight >= 0 AND semantic_weight <= 1),
    keyword_weight DECIMAL(3,2) DEFAULT 0.3 CHECK (keyword_weight >= 0 AND keyword_weight <= 1),
    
    -- Retrieval augmentation settings
    max_context_tokens INTEGER DEFAULT 4096,
    include_metadata_in_context BOOLEAN DEFAULT true,
    context_template TEXT DEFAULT E'[CONTEXT START]\n{context}\n[CONTEXT END]\n\nUser question: {question}',
    
    -- Fallback settings
    fallback_response TEXT DEFAULT 'I don''t have enough information to answer that question.',
    enable_fallback BOOLEAN DEFAULT true,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional config
    additional_config JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLE: ollama_embedding_configs
-- Stores embedding-specific configurations for vector generation
-- ============================================================================
CREATE TABLE IF NOT EXISTS ollama_embedding_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Model settings
    model_name VARCHAR(255) NOT NULL DEFAULT 'nomic-embed-text',
    provider VARCHAR(50) DEFAULT 'ollama',
    dimension INTEGER NOT NULL DEFAULT 768,
    
    -- Ollama endpoint settings
    endpoint_url VARCHAR(500) DEFAULT 'http://localhost:11434',
    api_path VARCHAR(255) DEFAULT '/api/embed',
    
    -- Processing settings
    batch_size INTEGER DEFAULT 32,
    max_retries INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 30000,
    
    -- Normalization settings
    normalize_embeddings BOOLEAN DEFAULT true,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    additional_config JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLE: rag_documents
-- Stores documents with their embeddings for RAG retrieval
-- ============================================================================
DO $$
DECLARE
    vector_available BOOLEAN;
BEGIN
    -- Check if pgvector is available
    vector_available := EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'vector'
    );
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_documents') THEN
        IF vector_available THEN
            EXECUTE $embed$
                CREATE TABLE rag_documents (
                    id BIGSERIAL PRIMARY KEY,
                    doc_id TEXT NOT NULL,
                    namespace TEXT NOT NULL DEFAULT 'default',
                    title TEXT,
                    content TEXT NOT NULL,
                    chunk_index INTEGER DEFAULT 0,
                    total_chunks INTEGER DEFAULT 1,
                    
                    -- Embedding (768 dimensions for nomic-embed-text)
                    embedding VECTOR(768),
                    
                    -- Document metadata
                    metadata JSONB DEFAULT '{}'::jsonb,
                    source_url TEXT,
                    source_type VARCHAR(50),
                    file_path TEXT,
                    
                    -- Processing info
                    embedding_model VARCHAR(255),
                    embedding_config_id INTEGER,
                    
                    -- Versioning
                    version INTEGER DEFAULT 1,
                    parent_doc_id TEXT,
                    
                    -- Timestamps
                    indexed_at TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    
                    UNIQUE(doc_id, namespace, chunk_index)
                )
            $embed$;
            
            -- Create vector similarity index
            EXECUTE 'CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx ON rag_documents USING ivfflat (embedding vector_l2_ops) WITH (lists = 128)';
        ELSE
            EXECUTE $embed_fallback$
                CREATE TABLE rag_documents (
                    id BIGSERIAL PRIMARY KEY,
                    doc_id TEXT NOT NULL,
                    namespace TEXT NOT NULL DEFAULT 'default',
                    title TEXT,
                    content TEXT NOT NULL,
                    chunk_index INTEGER DEFAULT 0,
                    total_chunks INTEGER DEFAULT 1,
                    
                    -- Embedding fallback (array for non-pgvector)
                    embedding DOUBLE PRECISION[],
                    
                    -- Document metadata
                    metadata JSONB DEFAULT '{}'::jsonb,
                    source_url TEXT,
                    source_type VARCHAR(50),
                    file_path TEXT,
                    
                    -- Processing info
                    embedding_model VARCHAR(255),
                    embedding_config_id INTEGER,
                    
                    -- Versioning
                    version INTEGER DEFAULT 1,
                    parent_doc_id TEXT,
                    
                    -- Timestamps
                    indexed_at TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    
                    UNIQUE(doc_id, namespace, chunk_index)
                )
            $embed_fallback$;
            
            RAISE NOTICE 'pgvector not available; rag_documents.embedding uses double precision[] fallback.';
        END IF;
    END IF;
END;
$$;

-- ============================================================================
-- TABLE: rag_query_history
-- Stores RAG query history for analytics and improvement
-- ============================================================================
CREATE TABLE IF NOT EXISTS rag_query_history (
    id BIGSERIAL PRIMARY KEY,
    query_id UUID DEFAULT gen_random_uuid(),
    namespace TEXT DEFAULT 'default',
    
    -- Query info
    query_text TEXT NOT NULL,
    query_embedding_model VARCHAR(255),
    
    -- Retrieved documents
    retrieved_doc_ids TEXT[],
    retrieval_scores DECIMAL[],
    top_k_used INTEGER,
    
    -- Response info
    response_text TEXT,
    model_used VARCHAR(255),
    
    -- Configuration used
    model_config_id INTEGER REFERENCES ollama_model_configs(id),
    rag_config_id INTEGER REFERENCES ollama_rag_configs(id),
    
    -- Performance metrics
    retrieval_time_ms INTEGER,
    generation_time_ms INTEGER,
    total_time_ms INTEGER,
    
    -- User feedback (optional)
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Session info
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: ollama_model_presets
-- Stores pre-configured model presets for quick selection
-- ============================================================================
CREATE TABLE IF NOT EXISTS ollama_model_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100), -- 'chat', 'code', 'rag', 'creative', 'precise'
    
    -- References
    model_config_id INTEGER REFERENCES ollama_model_configs(id),
    rag_config_id INTEGER REFERENCES ollama_rag_configs(id),
    embedding_config_id INTEGER REFERENCES ollama_embedding_configs(id),
    
    -- Quick settings
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false, -- System presets cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ollama_model_configs_active ON ollama_model_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ollama_model_configs_default ON ollama_model_configs(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_ollama_rag_configs_active ON ollama_rag_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ollama_rag_configs_model ON ollama_rag_configs(model_config_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_namespace ON rag_documents(namespace);
CREATE INDEX IF NOT EXISTS idx_rag_documents_doc_id ON rag_documents(doc_id);
CREATE INDEX IF NOT EXISTS idx_rag_query_history_session ON rag_query_history(session_id);
CREATE INDEX IF NOT EXISTS idx_rag_query_history_user ON rag_query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_query_history_created ON rag_query_history(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ollama_model_configs_updated_at ON ollama_model_configs;
CREATE TRIGGER update_ollama_model_configs_updated_at
    BEFORE UPDATE ON ollama_model_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ollama_rag_configs_updated_at ON ollama_rag_configs;
CREATE TRIGGER update_ollama_rag_configs_updated_at
    BEFORE UPDATE ON ollama_rag_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ollama_embedding_configs_updated_at ON ollama_embedding_configs;
CREATE TRIGGER update_ollama_embedding_configs_updated_at
    BEFORE UPDATE ON ollama_embedding_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rag_documents_updated_at ON rag_documents;
CREATE TRIGGER update_rag_documents_updated_at
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default model configuration (LightDom DeepSeek)
INSERT INTO ollama_model_configs (
    name, display_name, description, base_model,
    temperature, top_p, top_k, repeat_penalty,
    num_ctx, mirostat, mirostat_eta, mirostat_tau,
    stop_sequences, system_prompt, is_default
) VALUES (
    'lightdom-deepseek',
    'LightDom DeepSeek',
    'Full-featured DeepSeek R1 model configured for LightDom platform',
    'deepseek-r1:14b',
    0.7, 0.9, 40, 1.1,
    16384, 2, 0.1, 5.0,
    '["<|im_end|>", "</s>", "<|end|>"]'::jsonb,
    'You are LightDom AI, an expert assistant for the LightDom DOM optimization and blockchain mining platform.

## Your Expertise
- DOM analysis and optimization
- Blockchain proof-of-optimization mining
- Web crawling and SEO automation
- Workflow orchestration
- Metaverse bridge management

## Response Style
- Be concise and actionable
- Provide code examples when helpful
- Reference API endpoints when appropriate',
    true
) ON CONFLICT (name) DO NOTHING;

-- Insert lite model configuration
INSERT INTO ollama_model_configs (
    name, display_name, description, base_model,
    temperature, top_p, top_k, num_ctx,
    system_prompt, is_default
) VALUES (
    'lightdom-deepseek-lite',
    'LightDom DeepSeek Lite',
    'Lightweight DeepSeek model for faster responses on limited hardware',
    'deepseek-coder:6.7b',
    0.6, 0.85, 30, 4096,
    'You are LightDom AI, an assistant for the LightDom platform. Be concise and helpful.',
    false
) ON CONFLICT (name) DO NOTHING;

-- Insert default embedding configuration
INSERT INTO ollama_embedding_configs (
    name, display_name, description,
    model_name, provider, dimension,
    endpoint_url, is_default
) VALUES (
    'nomic-embed-default',
    'Nomic Embed Text',
    'Default embedding model for RAG with 768 dimensions',
    'nomic-embed-text', 'ollama', 768,
    'http://localhost:11434',
    true
) ON CONFLICT (name) DO NOTHING;

-- Insert default RAG configuration
INSERT INTO ollama_rag_configs (
    name, display_name, description,
    embedding_model, embedding_dimension,
    chunk_size, chunk_overlap,
    top_k, min_score,
    hybrid_search_enabled, semantic_weight, keyword_weight,
    is_default
) VALUES (
    'default-rag',
    'Default RAG Configuration',
    'Standard RAG configuration for LightDom platform',
    'nomic-embed-text', 768,
    1000, 200,
    5, 0.6,
    true, 0.7, 0.3,
    true
) ON CONFLICT (name) DO NOTHING;

-- Insert model presets
INSERT INTO ollama_model_presets (name, display_name, description, category, icon, sort_order, is_system) VALUES
    ('chat', 'General Chat', 'Balanced settings for general conversation', 'chat', '💬', 1, true),
    ('code', 'Code Generation', 'Optimized for writing and analyzing code', 'code', '💻', 2, true),
    ('rag', 'RAG / Knowledge', 'Configured for retrieval-augmented generation', 'rag', '📚', 3, true),
    ('creative', 'Creative Writing', 'Higher temperature for creative outputs', 'creative', '✨', 4, true),
    ('precise', 'Precise / Factual', 'Lower temperature for accurate, factual responses', 'precise', '🎯', 5, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active configurations with related data
CREATE OR REPLACE VIEW v_active_ollama_configs AS
SELECT 
    mc.id as model_config_id,
    mc.name as model_name,
    mc.display_name as model_display_name,
    mc.base_model,
    mc.temperature,
    mc.top_p,
    mc.num_ctx,
    mc.system_prompt,
    rc.id as rag_config_id,
    rc.name as rag_name,
    rc.embedding_model,
    rc.chunk_size,
    rc.top_k,
    rc.hybrid_search_enabled,
    ec.id as embedding_config_id,
    ec.model_name as embedding_model_name,
    ec.dimension as embedding_dimension
FROM ollama_model_configs mc
LEFT JOIN ollama_rag_configs rc ON rc.model_config_id = mc.id AND rc.is_active = true
LEFT JOIN ollama_embedding_configs ec ON ec.name = rc.embedding_model AND ec.is_active = true
WHERE mc.is_active = true;

-- View for RAG document statistics
CREATE OR REPLACE VIEW v_rag_document_stats AS
SELECT 
    namespace,
    COUNT(DISTINCT doc_id) as total_documents,
    COUNT(*) as total_chunks,
    AVG(total_chunks) as avg_chunks_per_doc,
    MAX(indexed_at) as last_indexed,
    COUNT(DISTINCT embedding_model) as embedding_models_used
FROM rag_documents
GROUP BY namespace;

COMMENT ON TABLE ollama_model_configs IS 'Stores Ollama Modelfile configurations for custom models';
COMMENT ON TABLE ollama_rag_configs IS 'RAG-specific configurations for document processing and retrieval';
COMMENT ON TABLE ollama_embedding_configs IS 'Embedding model configurations for vector generation';
COMMENT ON TABLE rag_documents IS 'Documents with embeddings for RAG retrieval';
COMMENT ON TABLE rag_query_history IS 'Query history for RAG analytics and improvement';
COMMENT ON TABLE ollama_model_presets IS 'Pre-configured model presets for quick selection';
