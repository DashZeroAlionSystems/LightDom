-- Migration: Voice Streaming Service
-- Description: Tables for voice streaming service with DeepSeek integration
-- Features: Voice configurations, wake word detection, TTS/STT settings, bidirectional streams
-- Created: 2025-11-29

-- Voice service configurations table
CREATE TABLE IF NOT EXISTS voice_service_configs (
    id SERIAL PRIMARY KEY,
    config_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Wake word settings
    wake_word VARCHAR(100) DEFAULT 'hello deepseek',
    wake_word_sensitivity DECIMAL(3,2) DEFAULT 0.7,
    wake_word_enabled BOOLEAN DEFAULT true,
    
    -- Voice input settings
    language VARCHAR(20) DEFAULT 'en-US',
    speech_recognition_model VARCHAR(100) DEFAULT 'whisper',
    input_sample_rate INTEGER DEFAULT 16000,
    input_channels INTEGER DEFAULT 1,
    noise_cancellation_enabled BOOLEAN DEFAULT true,
    vad_enabled BOOLEAN DEFAULT true,  -- Voice Activity Detection
    vad_threshold DECIMAL(3,2) DEFAULT 0.5,
    
    -- Voice output settings (TTS)
    tts_provider VARCHAR(100) DEFAULT 'native',
    tts_voice_id VARCHAR(255) DEFAULT 'default',
    tts_voice_name VARCHAR(255) DEFAULT 'Deepseek Natural',
    tts_speed DECIMAL(3,2) DEFAULT 1.0,
    tts_pitch DECIMAL(3,2) DEFAULT 1.0,
    tts_volume DECIMAL(3,2) DEFAULT 1.0,
    tts_enabled BOOLEAN DEFAULT true,
    
    -- Bidirectional streaming settings
    bidi_streaming_enabled BOOLEAN DEFAULT true,
    stream_buffer_size INTEGER DEFAULT 4096,
    max_stream_duration_seconds INTEGER DEFAULT 300,
    
    -- Privacy settings
    privacy_mode VARCHAR(50) DEFAULT 'wake_word_only' CHECK (privacy_mode IN (
        'wake_word_only',      -- Only listens after wake word
        'push_to_talk',        -- Requires button press
        'always_listening',    -- Continuous (with user consent)
        'disabled'             -- Voice disabled
    )),
    auto_stop_on_silence_seconds INTEGER DEFAULT 3,
    delete_recordings_after_processing BOOLEAN DEFAULT true,
    
    -- Auto-run and workflow settings
    autorun_enabled BOOLEAN DEFAULT false,
    default_workflow_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
    is_default BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Voice sessions table - tracks individual voice conversations
CREATE TABLE IF NOT EXISTS voice_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    config_id VARCHAR(255) REFERENCES voice_service_configs(config_id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    campaign_id VARCHAR(255),
    
    -- Session state
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active',
        'paused',
        'processing',
        'completed',
        'error',
        'cancelled'
    )),
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_duration_ms INTEGER DEFAULT 0,
    
    -- Statistics
    messages_count INTEGER DEFAULT 0,
    voice_input_duration_ms INTEGER DEFAULT 0,
    voice_output_duration_ms INTEGER DEFAULT 0,
    wake_word_detections INTEGER DEFAULT 0,
    
    -- Context
    context JSONB DEFAULT '{}'::jsonb,
    last_transcript TEXT,
    last_response TEXT,
    
    -- Error tracking
    error_message TEXT,
    error_code VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Voice messages table - individual voice exchanges
CREATE TABLE IF NOT EXISTS voice_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    session_id VARCHAR(255) REFERENCES voice_sessions(session_id) ON DELETE CASCADE,
    
    -- Message type
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('input', 'output')),
    message_type VARCHAR(50) DEFAULT 'voice' CHECK (message_type IN (
        'voice',           -- Voice input/output
        'text',            -- Text fallback
        'wake_word',       -- Wake word detection
        'command',         -- Voice command
        'system'           -- System message
    )),
    
    -- Content
    transcript TEXT,
    audio_url VARCHAR(1000),
    audio_duration_ms INTEGER,
    
    -- Processing results
    confidence_score DECIMAL(5,4),
    language_detected VARCHAR(20),
    sentiment VARCHAR(50),
    intent JSONB DEFAULT '{}'::jsonb,
    entities JSONB DEFAULT '[]'::jsonb,
    
    -- DeepSeek integration
    deepseek_request_id VARCHAR(255),
    deepseek_model VARCHAR(100),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Voice commands registry - predefined voice commands
CREATE TABLE IF NOT EXISTS voice_commands (
    id SERIAL PRIMARY KEY,
    command_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    
    -- Command definition
    command_phrase VARCHAR(500) NOT NULL,
    command_pattern VARCHAR(500),  -- Regex pattern for flexible matching
    command_type VARCHAR(50) DEFAULT 'action' CHECK (command_type IN (
        'wake_word',
        'action',
        'query',
        'navigation',
        'workflow',
        'system'
    )),
    
    -- Action to perform
    action_type VARCHAR(100) NOT NULL,
    action_config JSONB DEFAULT '{}'::jsonb,
    workflow_id VARCHAR(255),
    
    -- Settings
    requires_confirmation BOOLEAN DEFAULT false,
    response_template TEXT,
    priority INTEGER DEFAULT 5,
    is_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    description TEXT,
    category VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- TTS voice options table
CREATE TABLE IF NOT EXISTS tts_voices (
    id SERIAL PRIMARY KEY,
    voice_id VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(100) NOT NULL DEFAULT 'native',
    
    -- Voice characteristics
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    language VARCHAR(20) DEFAULT 'en-US',
    gender VARCHAR(20),
    age_group VARCHAR(50),
    accent VARCHAR(100),
    
    -- Voice quality
    quality VARCHAR(50) DEFAULT 'standard' CHECK (quality IN ('standard', 'enhanced', 'neural', 'premium')),
    sample_audio_url VARCHAR(1000),
    
    -- Settings
    is_default BOOLEAN DEFAULT false,
    is_enabled BOOLEAN DEFAULT true,
    supports_ssml BOOLEAN DEFAULT true,
    supports_streaming BOOLEAN DEFAULT true,
    
    -- Limits
    max_text_length INTEGER DEFAULT 5000,
    rate_limit_per_minute INTEGER DEFAULT 60,
    
    -- Metadata
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Voice service workflows - bundled service operations
CREATE TABLE IF NOT EXISTS voice_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    
    -- Workflow definition
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Steps definition
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    /* 
    Example steps structure:
    [
        {"step": 1, "type": "api_call", "endpoint": "/api/speech-to-text", "config": {}},
        {"step": 2, "type": "process", "handler": "deepseek_chat", "config": {}},
        {"step": 3, "type": "api_call", "endpoint": "/api/text-to-speech", "config": {}},
        {"step": 4, "type": "output", "target": "audio_stream", "config": {}}
    ]
    */
    
    -- Workflow settings
    autorun_enabled BOOLEAN DEFAULT false,
    start_trigger VARCHAR(100),
    stop_trigger VARCHAR(100),
    
    -- Data handling
    input_schema JSONB DEFAULT '{}'::jsonb,
    output_schema JSONB DEFAULT '{}'::jsonb,
    save_run_data BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'testing')),
    version INTEGER DEFAULT 1,
    
    -- Metadata
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Voice workflow runs - execution history
CREATE TABLE IF NOT EXISTS voice_workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    workflow_id VARCHAR(255) REFERENCES voice_workflows(workflow_id) ON DELETE SET NULL,
    session_id VARCHAR(255) REFERENCES voice_sessions(session_id) ON DELETE SET NULL,
    
    -- Execution state
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'running',
        'completed',
        'failed',
        'cancelled'
    )),
    current_step INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_duration_ms INTEGER,
    
    -- Data
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    step_results JSONB DEFAULT '[]'::jsonb,
    
    -- Error handling
    error_message TEXT,
    error_step INTEGER,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Bidirectional stream connections
CREATE TABLE IF NOT EXISTS bidi_stream_connections (
    id SERIAL PRIMARY KEY,
    connection_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::varchar,
    session_id VARCHAR(255) REFERENCES voice_sessions(session_id) ON DELETE CASCADE,
    
    -- Connection details
    connection_type VARCHAR(50) DEFAULT 'websocket' CHECK (connection_type IN (
        'websocket',
        'webrtc',
        'grpc',
        'sse'
    )),
    client_id VARCHAR(255),
    
    -- State
    status VARCHAR(50) DEFAULT 'connected' CHECK (status IN (
        'connecting',
        'connected',
        'streaming',
        'paused',
        'disconnected',
        'error'
    )),
    
    -- Statistics
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    packets_sent INTEGER DEFAULT 0,
    packets_received INTEGER DEFAULT 0,
    latency_ms INTEGER,
    
    -- Timing
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP,
    
    -- Metadata
    client_info JSONB DEFAULT '{}'::jsonb,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Insert default voice configuration
INSERT INTO voice_service_configs (
    config_id, name, description, is_default, status
) VALUES (
    'default-voice-config',
    'Default Voice Configuration',
    'Default voice streaming configuration for DeepSeek integration',
    true,
    'active'
) ON CONFLICT (config_id) DO NOTHING;

-- Insert default TTS voices
INSERT INTO tts_voices (voice_id, provider, name, display_name, language, gender, is_default) VALUES
('deepseek-natural', 'native', 'Deepseek Natural', 'DeepSeek Natural', 'en-US', 'neutral', true),
('deepseek-professional', 'native', 'Deepseek Professional', 'DeepSeek Professional', 'en-US', 'neutral', false),
('deepseek-friendly', 'native', 'Deepseek Friendly', 'DeepSeek Friendly', 'en-US', 'neutral', false)
ON CONFLICT (voice_id) DO NOTHING;

-- Insert default voice commands
INSERT INTO voice_commands (command_id, command_phrase, command_pattern, command_type, action_type, description) VALUES
('wake-hello-deepseek', 'hello deepseek', '(?i)(hello|hey|hi)\s*deepseek', 'wake_word', 'activate_listening', 'Wake word to activate voice listening'),
('wake-deepseek-out', 'deepseek out loud', '(?i)deepseek\s*(out\s*loud|speak|talk)', 'wake_word', 'activate_listening', 'Alternative wake word'),
('stop-listening', 'stop listening', '(?i)(stop|cancel)\s*(listening|recording)', 'system', 'stop_recording', 'Stop voice recording'),
('read-report', 'read the report', '(?i)read\s*(the|my|this)?\s*report', 'action', 'read_report', 'Read the current report aloud')
ON CONFLICT (command_id) DO NOTHING;

-- Insert default voice workflow
INSERT INTO voice_workflows (workflow_id, name, description, category, steps, status) VALUES
('voice-to-deepseek-response', 'Voice to DeepSeek Response', 'Standard voice input to DeepSeek response workflow', 'voice-interaction',
'[
    {"step": 1, "type": "detect_wake_word", "handler": "wake_word_detector", "config": {"sensitivity": 0.7}},
    {"step": 2, "type": "capture_audio", "handler": "audio_capture", "config": {"max_duration": 30, "silence_timeout": 3}},
    {"step": 3, "type": "speech_to_text", "handler": "whisper_stt", "config": {"language": "en"}},
    {"step": 4, "type": "process", "handler": "deepseek_chat", "config": {"model": "deepseek-r1:latest"}},
    {"step": 5, "type": "text_to_speech", "handler": "native_tts", "config": {"voice": "deepseek-natural"}},
    {"step": 6, "type": "stream_audio", "handler": "audio_output", "config": {"format": "mp3"}}
]'::jsonb, 'active')
ON CONFLICT (workflow_id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_configs_status ON voice_service_configs(status);
CREATE INDEX IF NOT EXISTS idx_voice_configs_default ON voice_service_configs(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_campaign ON voice_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created ON voice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_session ON voice_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_direction ON voice_messages(direction);
CREATE INDEX IF NOT EXISTS idx_voice_messages_timestamp ON voice_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_voice_commands_type ON voice_commands(command_type);
CREATE INDEX IF NOT EXISTS idx_voice_commands_enabled ON voice_commands(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_tts_voices_provider ON tts_voices(provider);
CREATE INDEX IF NOT EXISTS idx_tts_voices_language ON tts_voices(language);
CREATE INDEX IF NOT EXISTS idx_tts_voices_default ON tts_voices(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_voice_workflows_status ON voice_workflows(status);
CREATE INDEX IF NOT EXISTS idx_voice_workflow_runs_workflow ON voice_workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_voice_workflow_runs_status ON voice_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_bidi_connections_session ON bidi_stream_connections(session_id);
CREATE INDEX IF NOT EXISTS idx_bidi_connections_status ON bidi_stream_connections(status);

-- Add update triggers
CREATE TRIGGER update_voice_configs_updated_at 
    BEFORE UPDATE ON voice_service_configs
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_sessions_updated_at 
    BEFORE UPDATE ON voice_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_commands_updated_at 
    BEFORE UPDATE ON voice_commands
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tts_voices_updated_at 
    BEFORE UPDATE ON tts_voices
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_workflows_updated_at 
    BEFORE UPDATE ON voice_workflows
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_workflow_runs_updated_at 
    BEFORE UPDATE ON voice_workflow_runs
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for active voice sessions
CREATE OR REPLACE VIEW v_active_voice_sessions AS
SELECT 
    vs.session_id,
    vs.user_id,
    vs.campaign_id,
    vs.status,
    vs.started_at,
    vs.messages_count,
    vs.last_transcript,
    vsc.name as config_name,
    vsc.wake_word,
    vsc.privacy_mode
FROM voice_sessions vs
LEFT JOIN voice_service_configs vsc ON vs.config_id = vsc.config_id
WHERE vs.status IN ('active', 'processing');

-- Create view for voice service statistics
CREATE OR REPLACE VIEW v_voice_service_stats AS
SELECT 
    COUNT(DISTINCT vs.session_id) as total_sessions,
    COUNT(DISTINCT vs.session_id) FILTER (WHERE vs.status = 'active') as active_sessions,
    SUM(vs.messages_count) as total_messages,
    SUM(vs.voice_input_duration_ms) as total_input_duration_ms,
    SUM(vs.voice_output_duration_ms) as total_output_duration_ms,
    AVG(vs.messages_count) as avg_messages_per_session,
    COUNT(DISTINCT vs.user_id) as unique_users
FROM voice_sessions vs
WHERE vs.created_at >= CURRENT_DATE - INTERVAL '30 days';

COMMENT ON TABLE voice_service_configs IS 'Voice streaming service configurations with wake word and TTS settings';
COMMENT ON TABLE voice_sessions IS 'Individual voice conversation sessions';
COMMENT ON TABLE voice_messages IS 'Voice messages exchanged in sessions';
COMMENT ON TABLE voice_commands IS 'Predefined voice commands for quick actions';
COMMENT ON TABLE tts_voices IS 'Available text-to-speech voices';
COMMENT ON TABLE voice_workflows IS 'Voice service workflow definitions';
COMMENT ON TABLE voice_workflow_runs IS 'Voice workflow execution history';
COMMENT ON TABLE bidi_stream_connections IS 'Bidirectional stream connection tracking';
