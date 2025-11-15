-- Migration: Create embeddings table for vector storage and similarity search
-- Adds a table to store document embeddings for RAG and vector search

CREATE TABLE IF NOT EXISTS embeddings (
  id BIGSERIAL PRIMARY KEY,
  doc_id TEXT,
  namespace TEXT NOT NULL DEFAULT 'default',
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index to support upsert semantics based on doc_id + namespace
CREATE UNIQUE INDEX IF NOT EXISTS embeddings_doc_namespace_idx ON embeddings (doc_id, namespace);

-- Vector index (ivfflat) for fast nearest-neighbor search. Tune 'lists' for your dataset size.
-- Note: ivfflat requires initialization (ANALYZE) after bulk inserts. If ivfflat is unsupported in your pgvector build, remove or change to a supported index type.
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 128);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON embeddings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON embeddings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();
