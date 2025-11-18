-- Feedback Loop System Schema
-- Comprehensive tracking of user feedback, preferences, A/B testing, and model interactions

-- User feedback on responses with detailed context
CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id INTEGER,
  conversation_id VARCHAR(255) NOT NULL,
  message_id VARCHAR(255) NOT NULL,
  
  -- Feedback details
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'neutral')),
  feedback_strength INTEGER CHECK (feedback_strength BETWEEN 1 AND 5), -- 1=weak, 5=strong
  feedback_reason TEXT,
  
  -- Context
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model_used VARCHAR(100),
  template_style VARCHAR(100),
  response_length INTEGER,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'invalidated')),
  workflow_stage VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_session_feedback (session_id, created_at DESC),
  INDEX idx_conversation_feedback (conversation_id),
  INDEX idx_feedback_type (feedback_type, created_at DESC),
  INDEX idx_user_feedback (user_id, created_at DESC) WHERE user_id IS NOT NULL
);

-- User preferences for model behavior and response styles
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  session_id VARCHAR(255),
  
  -- Preference details
  preference_category VARCHAR(100) NOT NULL, -- 'response_style', 'model_behavior', 'ui_layout', etc.
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT NOT NULL,
  preference_source VARCHAR(50) CHECK (preference_source IN ('explicit', 'inferred', 'ab_test')),
  
  -- Priority and confidence
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Track where preference came from
  source_feedback_id INTEGER REFERENCES user_feedback(id),
  source_ab_test_id INTEGER,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE (user_id, session_id, preference_category, preference_key),
  INDEX idx_user_prefs (user_id, is_active) WHERE user_id IS NOT NULL,
  INDEX idx_session_prefs (session_id, is_active),
  INDEX idx_preference_category (preference_category, is_active)
);

-- A/B testing system for comparing response templates and styles
CREATE TABLE IF NOT EXISTS ab_test_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL UNIQUE,
  campaign_description TEXT,
  
  -- Test configuration
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('template_style', 'response_format', 'model_selection', 'ui_layout', 'interaction_pattern')),
  variant_a JSONB NOT NULL, -- { template: 'detailed', style: 'formal' }
  variant_b JSONB NOT NULL, -- { template: 'concise', style: 'casual' }
  variant_c JSONB, -- Optional third variant
  
  -- Distribution
  traffic_allocation JSONB DEFAULT '{"a": 50, "b": 50}'::jsonb, -- Percentage per variant
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Minimum sample size before making decisions
  minimum_sample_size INTEGER DEFAULT 100,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.95,
  
  -- Results
  winning_variant VARCHAR(10),
  statistical_significance DECIMAL(5,4),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_ab_campaign_status (status, started_at DESC)
);

-- Track individual user participation in A/B tests
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
  user_id INTEGER,
  session_id VARCHAR(255) NOT NULL,
  
  -- Assignment
  assigned_variant VARCHAR(10) NOT NULL CHECK (assigned_variant IN ('a', 'b', 'c')),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Experience tracking
  interactions_count INTEGER DEFAULT 0,
  feedback_provided BOOLEAN DEFAULT false,
  preference_expressed BOOLEAN DEFAULT false,
  
  -- Outcome metrics
  positive_feedbacks INTEGER DEFAULT 0,
  negative_feedbacks INTEGER DEFAULT 0,
  conversion_achieved BOOLEAN DEFAULT false,
  time_to_decision INTERVAL,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE (campaign_id, session_id),
  INDEX idx_ab_assignment (campaign_id, assigned_variant),
  INDEX idx_ab_session (session_id, campaign_id)
);

-- Admin-driven A/B test questions and user responses
CREATE TABLE IF NOT EXISTS ab_test_questions (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
  
  -- Question details
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('preference', 'comparison', 'rating', 'open_ended')),
  
  -- Options (for multiple choice)
  options JSONB, -- { "a": "Style A", "b": "Style B" }
  
  -- Display settings
  show_after_interactions INTEGER DEFAULT 5,
  show_probability DECIMAL(3,2) DEFAULT 1.0 CHECK (show_probability BETWEEN 0 AND 1),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_ab_question_campaign (campaign_id, is_active)
);

-- User responses to A/B test questions
CREATE TABLE IF NOT EXISTS ab_test_responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES ab_test_questions(id) ON DELETE CASCADE,
  assignment_id INTEGER NOT NULL REFERENCES ab_test_assignments(id) ON DELETE CASCADE,
  campaign_id INTEGER NOT NULL REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
  
  -- Response
  response_value TEXT NOT NULL,
  response_variant VARCHAR(10), -- Which variant did they prefer
  response_time_ms INTEGER,
  
  -- Context
  interaction_count_at_response INTEGER,
  shown_at TIMESTAMP,
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_ab_response_question (question_id, responded_at DESC),
  INDEX idx_ab_response_campaign (campaign_id, responded_at DESC)
);

-- Comprehensive communication logs for all services
CREATE TABLE IF NOT EXISTS communication_logs (
  id SERIAL PRIMARY KEY,
  
  -- Communication details
  log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('prompt', 'response', 'error', 'system_message', 'user_action', 'service_call')),
  service_name VARCHAR(100) NOT NULL, -- 'rag', 'mining_campaign', 'neural_network', 'crawler'
  
  -- Content
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
  content TEXT NOT NULL,
  content_type VARCHAR(50), -- 'text', 'json', 'html', 'markdown'
  
  -- Context
  session_id VARCHAR(255),
  conversation_id VARCHAR(255),
  user_id INTEGER,
  request_id VARCHAR(255),
  
  -- Status workflow
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  workflow_stage VARCHAR(100),
  
  -- Performance metrics
  processing_time_ms INTEGER,
  token_count INTEGER,
  model_used VARCHAR(100),
  
  -- Error tracking
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relationships
  parent_log_id INTEGER REFERENCES communication_logs(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_comm_log_session (session_id, created_at DESC),
  INDEX idx_comm_log_service (service_name, created_at DESC),
  INDEX idx_comm_log_type (log_type, created_at DESC),
  INDEX idx_comm_log_status (status, workflow_stage),
  INDEX idx_comm_log_conversation (conversation_id, created_at DESC) WHERE conversation_id IS NOT NULL
);

-- Status-driven workflow tracking
CREATE TABLE IF NOT EXISTS workflow_states (
  id SERIAL PRIMARY KEY,
  
  -- Workflow details
  workflow_name VARCHAR(100) NOT NULL,
  workflow_type VARCHAR(50) NOT NULL, -- 'conversation', 'mining_campaign', 'ab_test', 'feedback_loop'
  entity_id VARCHAR(255) NOT NULL, -- ID of the entity being tracked
  
  -- State
  current_state VARCHAR(100) NOT NULL,
  previous_state VARCHAR(100),
  state_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  entered_state_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_exit_at TIMESTAMP,
  
  -- Relationships
  session_id VARCHAR(255),
  user_id INTEGER,
  parent_workflow_id INTEGER REFERENCES workflow_states(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_workflow_entity (workflow_type, entity_id, entered_state_at DESC),
  INDEX idx_workflow_state (workflow_name, current_state),
  INDEX idx_workflow_session (session_id, entered_state_at DESC) WHERE session_id IS NOT NULL
);

-- Model interaction patterns learned from feedback
CREATE TABLE IF NOT EXISTS model_interaction_patterns (
  id SERIAL PRIMARY KEY,
  
  -- Pattern details
  pattern_name VARCHAR(255) NOT NULL,
  pattern_category VARCHAR(100) NOT NULL, -- 'response_style', 'tone', 'length', 'detail_level'
  
  -- Pattern definition
  trigger_conditions JSONB NOT NULL, -- Conditions that activate this pattern
  response_modifications JSONB NOT NULL, -- How to modify the response
  
  -- Performance metrics
  usage_count INTEGER DEFAULT 0,
  positive_feedback_rate DECIMAL(5,4),
  negative_feedback_rate DECIMAL(5,4),
  avg_confidence_score DECIMAL(3,2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  learned_from_count INTEGER DEFAULT 1, -- How many feedback samples contributed
  
  -- Source tracking
  learned_from_campaign_id INTEGER REFERENCES ab_test_campaigns(id),
  learned_from_preference_ids INTEGER[], -- Array of preference IDs
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_pattern_category (pattern_category, is_active),
  INDEX idx_pattern_performance (positive_feedback_rate DESC, usage_count DESC) WHERE is_active = true
);

-- Create views for quick analytics

-- Feedback summary by model and template
CREATE OR REPLACE VIEW feedback_summary AS
SELECT 
  model_used,
  template_style,
  feedback_type,
  COUNT(*) as feedback_count,
  AVG(feedback_strength) as avg_strength,
  COUNT(DISTINCT session_id) as unique_sessions,
  DATE_TRUNC('day', created_at) as feedback_date
FROM user_feedback
WHERE status = 'active'
GROUP BY model_used, template_style, feedback_type, DATE_TRUNC('day', created_at);

-- A/B test performance
CREATE OR REPLACE VIEW ab_test_performance AS
SELECT 
  c.id as campaign_id,
  c.campaign_name,
  c.test_type,
  a.assigned_variant,
  COUNT(DISTINCT a.id) as participants,
  SUM(a.positive_feedbacks) as total_positive,
  SUM(a.negative_feedbacks) as total_negative,
  AVG(a.positive_feedbacks::float / NULLIF(a.interactions_count, 0)) as positive_rate,
  AVG(EXTRACT(EPOCH FROM a.time_to_decision)) as avg_decision_time_seconds
FROM ab_test_campaigns c
JOIN ab_test_assignments a ON c.id = a.campaign_id
WHERE c.status = 'active'
GROUP BY c.id, c.campaign_name, c.test_type, a.assigned_variant;

-- User preference aggregation
CREATE OR REPLACE VIEW user_preference_summary AS
SELECT 
  COALESCE(user_id::text, session_id) as user_identifier,
  preference_category,
  preference_key,
  preference_value,
  COUNT(*) as occurrence_count,
  AVG(confidence_score) as avg_confidence,
  MAX(updated_at) as last_updated
FROM user_preferences
WHERE is_active = true
GROUP BY COALESCE(user_id::text, session_id), preference_category, preference_key, preference_value;

-- Communication flow by service
CREATE OR REPLACE VIEW communication_flow AS
SELECT 
  service_name,
  log_type,
  status,
  workflow_stage,
  COUNT(*) as message_count,
  AVG(processing_time_ms) as avg_processing_time,
  AVG(token_count) as avg_tokens,
  COUNT(CASE WHEN error_code IS NOT NULL THEN 1 END) as error_count,
  DATE_TRUNC('hour', created_at) as log_hour
FROM communication_logs
GROUP BY service_name, log_type, status, workflow_stage, DATE_TRUNC('hour', created_at);

-- Add comments for documentation
COMMENT ON TABLE user_feedback IS 'Tracks all user feedback on model responses with detailed context for learning';
COMMENT ON TABLE user_preferences IS 'Stores learned user preferences from feedback patterns and A/B tests';
COMMENT ON TABLE ab_test_campaigns IS 'Manages A/B testing campaigns for comparing different response styles and templates';
COMMENT ON TABLE ab_test_assignments IS 'Tracks which variant each user is assigned to in A/B tests';
COMMENT ON TABLE ab_test_questions IS 'Admin-defined questions to gather explicit user preferences';
COMMENT ON TABLE ab_test_responses IS 'User responses to A/B test questions';
COMMENT ON TABLE communication_logs IS 'Comprehensive logs of all service communications for audit and analysis';
COMMENT ON TABLE workflow_states IS 'Status-driven workflow tracking for all system entities';
COMMENT ON TABLE model_interaction_patterns IS 'Learned patterns for optimizing model interactions based on feedback';

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
