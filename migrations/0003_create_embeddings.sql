-- Migration: Create embeddings table for vector storage and similarity search
-- Adds a table to store document embeddings for RAG and vector search

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'vector'
  ) THEN
    EXECUTE $$
      CREATE TABLE IF NOT EXISTS embeddings (
        id BIGSERIAL PRIMARY KEY,
        doc_id TEXT,
        namespace TEXT NOT NULL DEFAULT 'default',
        content TEXT,
        metadata JSONB,
        embedding VECTOR(1536),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    $$;

    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS embeddings_doc_namespace_idx ON embeddings (doc_id, namespace)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 128)';

    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    $fn$;

    EXECUTE 'DROP TRIGGER IF EXISTS set_updated_at ON embeddings';
    EXECUTE $trg$
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON embeddings
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_updated_at()
    $trg$;
  ELSE
    RAISE NOTICE 'pgvector (vector type) not available; skipping embeddings table creation.';
  END IF;
END;
$$;
