-- Wrapper for blockchain schema (idempotent)
-- Ensures base extensions and tables exist using blockchain_schema.sql

-- Enable basic extensions safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

