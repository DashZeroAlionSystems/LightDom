-- AI Interactions table for logging AI model interactions
-- Migration: 002_add_ai_interactions_table.sql

CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model VARCHAR(100) NOT NULL, -- e.g., 'ollama:r1', 'gpt-4', etc.
    prompt TEXT NOT NULL, -- The input prompt
    response TEXT NOT NULL, -- The AI response
    context JSONB DEFAULT '{}', -- Additional context like conversation history
    metadata JSONB DEFAULT '{}', -- Model parameters, token counts, etc.
    service VARCHAR(100), -- Which service made the request (e.g., 'PlanningService', 'OllamaService')
    user_id VARCHAR(255), -- Optional user identifier
    session_id VARCHAR(255), -- Optional session identifier
    duration_ms INTEGER, -- Response time in milliseconds
    success BOOLEAN DEFAULT true,
    error TEXT, -- Error message if success = false
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for model queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_model ON ai_interactions(model);

-- Index for service queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_service ON ai_interactions(service);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON ai_interactions(session_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Index for success/error analysis
CREATE INDEX IF NOT EXISTS idx_ai_interactions_success ON ai_interactions(success);
