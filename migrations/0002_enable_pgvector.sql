-- Enable pgvector extension for vector embeddings
-- This migration ensures the `vector` type is available in the database.

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_available_extensions
		WHERE name = 'vector'
	) THEN
		EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector';
	ELSE
		RAISE NOTICE 'pgvector extension is not installed on this server; skipping extension creation.';
	END IF;
END;
$$;
