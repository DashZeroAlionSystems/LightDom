-- Core LightDom platform tables for content and services
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Content entities table for storing various content types
-- Supports ResearchTopics, ExecutionPlans, AnalysisReports, etc.
CREATE TABLE IF NOT EXISTS content_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL, -- e.g., 'ld:ResearchTopic', 'ld:ExecutionPlan', 'ld:CompetitorAnalysisReport'
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}', -- Flexible content storage
    metadata JSONB DEFAULT '{}', -- Additional metadata
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255), -- User or system that created the entity
    is_active BOOLEAN DEFAULT true
);

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS idx_content_entities_type ON content_entities(type);

-- Index for tag-based searches
CREATE INDEX IF NOT EXISTS idx_content_entities_tags ON content_entities USING GIN(tags);

-- Index for JSONB content searches
CREATE INDEX IF NOT EXISTS idx_content_entities_content ON content_entities USING GIN(content);

-- Index for metadata searches
CREATE INDEX IF NOT EXISTS idx_content_entities_metadata ON content_entities USING GIN(metadata);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_content_entities_updated_at
    BEFORE UPDATE ON content_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
