-- Wrapper for blockchain schema (idempotent)
-- Ensures base extensions and tables exist using blockchain_schema.sql

-- Enable basic extensions safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Marker table to track applied chunks
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apply main schema file (execute separately via apply-schemas API)
-- This file serves as a placeholder to keep migration ordering.
INSERT INTO schema_migrations(name) VALUES ('01-blockchain')
ON CONFLICT (name) DO NOTHING;
