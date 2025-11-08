-- Enable pgvector extension for vector embeddings
-- This migration ensures the `vector` type is available in the database.

CREATE EXTENSION IF NOT EXISTS vector;
