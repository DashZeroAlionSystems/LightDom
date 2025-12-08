DO $$
DECLARE
  vector_available BOOLEAN;
  table_exists BOOLEAN;
  embedding_type TEXT;
BEGIN
  vector_available := EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'vector'
  );

  table_exists := EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'embeddings'
  );

  IF NOT table_exists THEN
    IF vector_available THEN
      EXECUTE $embed_vector$
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
      $embed_vector$;
    ELSE
      EXECUTE $embed_fallback$
        CREATE TABLE IF NOT EXISTS embeddings (
          id BIGSERIAL PRIMARY KEY,
          doc_id TEXT,
          namespace TEXT NOT NULL DEFAULT 'default',
          content TEXT,
          metadata JSONB,
          embedding DOUBLE PRECISION[],
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      $embed_fallback$;

      RAISE NOTICE 'pgvector not available; embeddings.embedding uses double precision[] fallback.';
    END IF;
  ELSE
    SELECT udt_name
    INTO embedding_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embeddings'
      AND column_name = 'embedding';

    IF embedding_type IS NULL THEN
      IF vector_available THEN
        EXECUTE 'ALTER TABLE embeddings ADD COLUMN embedding vector(1536)';
      ELSE
        EXECUTE 'ALTER TABLE embeddings ADD COLUMN embedding double precision[]';
        RAISE NOTICE 'pgvector not available; added embeddings.embedding as double precision[].';
      END IF;
    END IF;
  END IF;

  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS embeddings_doc_namespace_idx ON embeddings (doc_id, namespace)';

  IF vector_available THEN
    SELECT udt_name
    INTO embedding_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'embeddings'
      AND column_name = 'embedding';

    IF embedding_type = 'vector' THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 128)';
    ELSE
      RAISE NOTICE 'Vector type available but embeddings.embedding uses %, skipping vector index creation.', embedding_type;
    END IF;
  ELSE
    RAISE NOTICE 'pgvector not available; skipping vector similarity index creation for embeddings.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
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

DO $$
BEGIN
  IF to_regclass('public.embeddings') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS set_updated_at ON embeddings';
    EXECUTE 'CREATE TRIGGER set_updated_at BEFORE UPDATE ON embeddings FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at()';
  ELSE
    RAISE NOTICE 'embeddings table not found; skipping trigger creation.';
  END IF;
END;
$$;
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
