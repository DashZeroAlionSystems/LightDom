-- ============================================================================
-- Agent DeepSeek System Schema
-- Complete database schema for managing AI agents with DeepSeek integration
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- AGENT CONFIGURATION & MANAGEMENT
-- ============================================================================

-- Agent Modes - Defines the functional roles/modes agents can operate in
CREATE TABLE IF NOT EXISTS agent_modes (
    mode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    mode_type VARCHAR(100) NOT NULL, -- 'workflow', 'analysis', 'generation', 'optimization', 'mining'
    capabilities JSONB DEFAULT '[]', -- Array of capability identifiers
    function_definition TEXT NOT NULL, -- Description of what function the agent fulfills
    knowledge_graph JSONB DEFAULT '{}', -- Knowledge graph structure for this mode
    configuration_schema JSONB DEFAULT '{}', -- JSON schema for valid configuration
    default_config JSONB DEFAULT '{}', -- Default configuration values
    deepseek_prompt_template TEXT, -- Template for DeepSeek prompts in this mode
    rules JSONB DEFAULT '[]', -- Array of rules that guide agent behavior
    constraints JSONB DEFAULT '{}', -- Constraints and limitations
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

-- Agent Instances - Actual agent instances configured with specific modes
CREATE TABLE IF NOT EXISTS agent_instances (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mode_id UUID NOT NULL REFERENCES agent_modes(mode_id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'inactive', -- 'inactive', 'active', 'busy', 'error', 'paused'
    configuration JSONB DEFAULT '{}', -- Agent-specific configuration
    knowledge_graph JSONB DEFAULT '{}', -- Agent's personal knowledge graph
    learning_data JSONB DEFAULT '{}', -- Accumulated learning and patterns
    performance_metrics JSONB DEFAULT '{}', -- Performance tracking
    deepseek_config JSONB DEFAULT '{}', -- DeepSeek API configuration
    session_context JSONB DEFAULT '{}', -- Current session context
    tools_enabled TEXT[] DEFAULT '{}', -- Array of enabled tool IDs
    services_enabled TEXT[] DEFAULT '{}', -- Array of enabled service IDs
    model_name VARCHAR(255) DEFAULT 'deepseek-reasoner',
    model_version VARCHAR(100),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 4000,
    top_p DECIMAL(3,2) DEFAULT 0.95,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    created_by VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

-- Agent Sessions - Conversation/interaction sessions with agents
CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'archived'
    session_context JSONB DEFAULT '{}', -- Session-specific context
    conversation_history JSONB DEFAULT '[]', -- Array of messages
    knowledge_updates JSONB DEFAULT '{}', -- Knowledge gained in this session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Agent Messages - Individual messages in sessions
CREATE TABLE IF NOT EXISTS agent_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent_instances(agent_id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    tool_calls JSONB DEFAULT '[]', -- Tool/function calls made
    tool_results JSONB DEFAULT '[]', -- Results from tool calls
    token_count INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- KNOWLEDGE GRAPH SYSTEM
-- ============================================================================

-- Knowledge Nodes - Entities in the knowledge graph
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    mode_id UUID REFERENCES agent_modes(mode_id) ON DELETE CASCADE,
    node_type VARCHAR(100) NOT NULL, -- 'concept', 'entity', 'skill', 'tool', 'pattern', 'rule'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}', -- Node properties
    embedding VECTOR(1536), -- Vector embedding for similarity search (requires pgvector)
    confidence_score DECIMAL(5,4) DEFAULT 1.0,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Knowledge Relationships - Edges in the knowledge graph
CREATE TABLE IF NOT EXISTS knowledge_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_node_id UUID NOT NULL REFERENCES knowledge_nodes(node_id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES knowledge_nodes(node_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- 'requires', 'enables', 'uses', 'produces', 'depends_on', 'related_to'
    strength DECIMAL(5,4) DEFAULT 1.0, -- 0.0 to 1.0
    properties JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '[]', -- Array of evidence supporting this relationship
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Agent Rules - Behavioral rules for agents
CREATE TABLE IF NOT EXISTS agent_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode_id UUID REFERENCES agent_modes(mode_id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- 'constraint', 'preference', 'requirement', 'guideline', 'optimization'
    condition JSONB NOT NULL, -- Conditions when rule applies
    action JSONB NOT NULL, -- Action to take when condition met
    priority INTEGER DEFAULT 0, -- Higher priority rules take precedence
    is_mandatory BOOLEAN DEFAULT false,
    examples JSONB DEFAULT '[]', -- Example applications of the rule
    exceptions JSONB DEFAULT '[]', -- Exception cases
    success_criteria JSONB DEFAULT '{}',
    failure_handling JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- DEEPSEEK PROMPT MANAGEMENT
-- ============================================================================

-- Prompt Templates - Reusable prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'system', 'user', 'function', 'completion'
    template_text TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names used in template
    example_values JSONB DEFAULT '{}', -- Example values for variables
    mode_id UUID REFERENCES agent_modes(mode_id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    average_tokens INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Prompt Executions - History of prompt executions
CREATE TABLE IF NOT EXISTS prompt_executions (
    execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES prompt_templates(template_id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    response_text TEXT,
    variables_used JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'error', 'timeout'
    error_message TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    cost_estimate DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- AGENT CAPABILITIES & TOOLS
-- ============================================================================

-- Agent Capabilities - Functional capabilities agents can have
CREATE TABLE IF NOT EXISTS agent_capabilities (
    capability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    capability_type VARCHAR(100) NOT NULL, -- 'analysis', 'generation', 'optimization', 'transformation'
    required_tools TEXT[] DEFAULT '{}',
    required_knowledge JSONB DEFAULT '[]',
    skill_level VARCHAR(50) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    training_data_requirements JSONB DEFAULT '{}',
    performance_benchmarks JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Mode Capabilities - Mapping of modes to capabilities
CREATE TABLE IF NOT EXISTS mode_capabilities (
    mode_id UUID NOT NULL REFERENCES agent_modes(mode_id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES agent_capabilities(capability_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate',
    is_required BOOLEAN DEFAULT false,
    configuration_override JSONB DEFAULT '{}',
    PRIMARY KEY (mode_id, capability_id)
);

-- ============================================================================
-- LEARNING & OPTIMIZATION
-- ============================================================================

-- Agent Learning Events - Track learning and adaptation
CREATE TABLE IF NOT EXISTS agent_learning_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'pattern_discovered', 'rule_learned', 'optimization_found', 'error_analyzed'
    event_data JSONB NOT NULL,
    confidence_score DECIMAL(5,4),
    impact_assessment JSONB DEFAULT '{}',
    validation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'validated', 'rejected', 'incorporated'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Agent Performance Metrics - Performance tracking
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_instances(agent_id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'accuracy', 'speed', 'token_efficiency', 'task_completion'
    metric_value DECIMAL(10,4) NOT NULL,
    benchmark_value DECIMAL(10,4),
    measurement_context JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agent Modes
CREATE INDEX IF NOT EXISTS idx_agent_modes_type ON agent_modes(mode_type);
CREATE INDEX IF NOT EXISTS idx_agent_modes_active ON agent_modes(is_active);

-- Agent Instances
CREATE INDEX IF NOT EXISTS idx_agent_instances_mode ON agent_instances(mode_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_status ON agent_instances(status);
CREATE INDEX IF NOT EXISTS idx_agent_instances_active ON agent_instances(last_active_at);

-- Agent Sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created ON agent_sessions(created_at);

-- Agent Messages
CREATE INDEX IF NOT EXISTS idx_agent_messages_session ON agent_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_agent ON agent_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created ON agent_messages(created_at);

-- Knowledge Nodes
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_agent ON knowledge_nodes(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_mode ON knowledge_nodes(mode_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_type ON knowledge_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_name ON knowledge_nodes USING gin(name gin_trgm_ops);

-- Knowledge Relationships
CREATE INDEX IF NOT EXISTS idx_knowledge_rel_from ON knowledge_relationships(from_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_rel_to ON knowledge_relationships(to_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_rel_type ON knowledge_relationships(relationship_type);

-- Agent Rules
CREATE INDEX IF NOT EXISTS idx_agent_rules_mode ON agent_rules(mode_id);
CREATE INDEX IF NOT EXISTS idx_agent_rules_agent ON agent_rules(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_rules_type ON agent_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_agent_rules_priority ON agent_rules(priority DESC);

-- Prompt Templates
CREATE INDEX IF NOT EXISTS idx_prompt_templates_type ON prompt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_mode ON prompt_templates(mode_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

-- Prompt Executions
CREATE INDEX IF NOT EXISTS idx_prompt_exec_template ON prompt_executions(template_id);
CREATE INDEX IF NOT EXISTS idx_prompt_exec_agent ON prompt_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_exec_session ON prompt_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_prompt_exec_status ON prompt_executions(status);
CREATE INDEX IF NOT EXISTS idx_prompt_exec_created ON prompt_executions(created_at);

-- Learning Events
CREATE INDEX IF NOT EXISTS idx_learning_events_agent ON agent_learning_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_session ON agent_learning_events(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON agent_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_status ON agent_learning_events(validation_status);

-- Performance Metrics
CREATE INDEX IF NOT EXISTS idx_perf_metrics_agent ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_type ON agent_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_recorded ON agent_performance_metrics(recorded_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_agent_modes_updated_at BEFORE UPDATE ON agent_modes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_instances_updated_at BEFORE UPDATE ON agent_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON agent_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_nodes_updated_at BEFORE UPDATE ON knowledge_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_relationships_updated_at BEFORE UPDATE ON knowledge_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_rules_updated_at BEFORE UPDATE ON agent_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update usage counts
CREATE OR REPLACE FUNCTION increment_knowledge_node_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE knowledge_nodes
    SET usage_count = usage_count + 1,
        last_used_at = CURRENT_TIMESTAMP
    WHERE node_id = NEW.node_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- SEED DATA - Default Agent Modes
-- ============================================================================

INSERT INTO agent_modes (name, description, mode_type, function_definition, capabilities, rules) VALUES
('Workflow Orchestrator', 'Manages and executes complex workflows with multiple steps', 'workflow', 
 'Orchestrates multi-step workflows, coordinates service execution, handles dependencies and error recovery',
 '["workflow_execution", "dependency_management", "error_handling", "parallel_processing"]',
 '[
   {"type": "constraint", "description": "Always validate dependencies before execution"},
   {"type": "guideline", "description": "Prefer parallel execution when dependencies allow"},
   {"type": "requirement", "description": "Log all step transitions and failures"}
 ]'),

('Code Analyzer', 'Analyzes codebase structure, patterns, and relationships', 'analysis',
 'Analyzes code files, discovers patterns, builds knowledge graphs of codebase structure and relationships',
 '["code_parsing", "pattern_recognition", "dependency_analysis", "documentation_generation"]',
 '[
   {"type": "guideline", "description": "Focus on architectural patterns first"},
   {"type": "constraint", "description": "Respect language-specific conventions"},
   {"type": "optimization", "description": "Cache analysis results for frequently accessed files"}
 ]'),

('Content Generator', 'Generates various types of content based on templates and context', 'generation',
 'Creates documentation, code, configurations, and other content using templates and AI assistance',
 '["text_generation", "code_generation", "template_rendering", "context_awareness"]',
 '[
   {"type": "guideline", "description": "Use existing patterns and conventions"},
   {"type": "requirement", "description": "Validate generated output against schemas"},
   {"type": "preference", "description": "Prefer composition over duplication"}
 ]'),

('SEO Optimizer', 'Optimizes content and structure for search engine visibility', 'optimization',
 'Analyzes and optimizes web content, DOM structure, metadata for improved SEO performance',
 '["seo_analysis", "dom_optimization", "metadata_generation", "performance_optimization"]',
 '[
   {"type": "constraint", "description": "Never sacrifice user experience for SEO"},
   {"type": "guideline", "description": "Follow search engine best practices"},
   {"type": "requirement", "description": "Measure impact of optimizations"}
 ]'),

('Data Mining Agent', 'Extracts and processes data from various sources', 'mining',
 'Crawls websites, extracts structured data, processes and enriches information',
 '["web_crawling", "data_extraction", "data_enrichment", "pattern_matching"]',
 '[
   {"type": "constraint", "description": "Respect robots.txt and rate limits"},
   {"type": "guideline", "description": "Validate extracted data quality"},
   {"type": "requirement", "description": "Track and log all data sources"}
 ]'),

('Custom Agent', 'Flexible agent mode for custom-defined functions', 'custom',
 'User-defined agent with custom capabilities and rules configured at runtime',
 '["flexible_execution", "custom_functions", "dynamic_configuration"]',
 '[
   {"type": "guideline", "description": "Validate configuration before execution"},
   {"type": "requirement", "description": "Document custom behaviors"}
 ]')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_modes IS 'Defines functional modes/roles that agents can operate in';
COMMENT ON TABLE agent_instances IS 'Actual agent instances configured with specific modes and DeepSeek integration';
COMMENT ON TABLE agent_sessions IS 'Conversation/interaction sessions with agents';
COMMENT ON TABLE agent_messages IS 'Individual messages exchanged in agent sessions';
COMMENT ON TABLE knowledge_nodes IS 'Entities in the agent knowledge graph';
COMMENT ON TABLE knowledge_relationships IS 'Relationships between knowledge graph entities';
COMMENT ON TABLE agent_rules IS 'Behavioral rules that guide agent decision-making';
COMMENT ON TABLE prompt_templates IS 'Reusable templates for DeepSeek prompts';
COMMENT ON TABLE prompt_executions IS 'History of prompt executions and responses';
COMMENT ON TABLE agent_capabilities IS 'Functional capabilities that agents can possess';
COMMENT ON TABLE agent_learning_events IS 'Track agent learning and adaptation over time';
COMMENT ON TABLE agent_performance_metrics IS 'Performance measurements for agent optimization';
