/**
 * Advanced Database Schema for Knowledge Graph-Based Code Intelligence
 * 
 * This schema supports:
 * - Configuration-driven data storage
 * - Algorithmic crawling rules
 * - Knowledge graph relationships
 * - Code entity tracking
 * - Git workflow automation
 * - Agent memory and learning
 */

-- ============================================================================
-- CORE KNOWLEDGE GRAPH TABLES
-- ============================================================================

-- Entities: Code entities (functions, classes, files, modules, etc.)
CREATE TABLE IF NOT EXISTS code_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id TEXT UNIQUE NOT NULL,
    entity_type TEXT NOT NULL, -- 'function', 'class', 'file', 'module', 'component'
    name TEXT NOT NULL,
    file_path TEXT,
    line_start INTEGER,
    line_end INTEGER,
    signature TEXT, -- Function/method signature
    description TEXT,
    language TEXT, -- 'javascript', 'typescript', 'python', etc.
    
    -- Semantic embeddings for AI search
    embedding VECTOR(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    complexity_score REAL DEFAULT 0,
    last_modified TIMESTAMP,
    
    -- Knowledge graph properties
    properties JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT valid_entity_type CHECK (entity_type IN (
        'function', 'class', 'file', 'module', 'component', 
        'interface', 'type', 'constant', 'variable',
        'api_endpoint', 'database_table', 'service'
    ))
);

CREATE INDEX idx_code_entities_type ON code_entities(entity_type);
CREATE INDEX idx_code_entities_file ON code_entities(file_path);
CREATE INDEX idx_code_entities_name ON code_entities(name);
CREATE INDEX idx_code_entities_embedding ON code_entities USING ivfflat (embedding vector_cosine_ops);

-- Relationships: How code entities relate to each other
CREATE TABLE IF NOT EXISTS code_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id TEXT UNIQUE NOT NULL,
    
    from_entity_id TEXT NOT NULL REFERENCES code_entities(entity_id) ON DELETE CASCADE,
    to_entity_id TEXT NOT NULL REFERENCES code_entities(entity_id) ON DELETE CASCADE,
    
    relationship_type TEXT NOT NULL,
    -- 'calls', 'imports', 'extends', 'implements', 'uses', 'depends_on',
    -- 'defines', 'exports', 'references', 'instantiates', 'decorates'
    
    weight REAL DEFAULT 1.0,
    confidence REAL DEFAULT 1.0,
    
    -- Context
    context JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_relationship CHECK (relationship_type IN (
        'calls', 'imports', 'extends', 'implements', 'uses', 'depends_on',
        'defines', 'exports', 'references', 'instantiates', 'decorates',
        'tests', 'mocks', 'observes', 'listens_to', 'emits'
    ))
);

CREATE INDEX idx_code_relationships_from ON code_relationships(from_entity_id);
CREATE INDEX idx_code_relationships_to ON code_relationships(to_entity_id);
CREATE INDEX idx_code_relationships_type ON code_relationships(relationship_type);

-- ============================================================================
-- STORYBOOK DATA WITH ALGORITHMIC CONFIGURATION
-- ============================================================================

-- Crawler configurations with algorithmic rules
CREATE TABLE IF NOT EXISTS crawler_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Algorithmic rules
    algorithm_type TEXT NOT NULL, -- 'storybook', 'component', 'api', 'documentation'
    extraction_rules JSONB NOT NULL, -- JSON schema for what to extract
    transformation_rules JSONB DEFAULT '{}', -- How to transform extracted data
    validation_rules JSONB DEFAULT '{}', -- Validation schema
    
    -- Target configuration
    target_patterns TEXT[], -- URL patterns to match
    exclude_patterns TEXT[],
    
    -- Storage configuration
    storage_strategy TEXT DEFAULT 'normalized', -- 'normalized', 'denormalized', 'hybrid'
    target_tables TEXT[], -- Which tables to store data in
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawler_config_algorithm ON crawler_configurations(algorithm_type);
CREATE INDEX idx_crawler_config_active ON crawler_configurations(is_active);

-- Attributes: Generic storage for any crawled data with drill-down capability
CREATE TABLE IF NOT EXISTS crawled_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationship to source
    source_id UUID, -- References different tables based on source_type
    source_type TEXT NOT NULL, -- 'storybook', 'component', 'story', 'code_entity'
    source_url TEXT,
    
    -- Crawler configuration
    crawler_config_id TEXT REFERENCES crawler_configurations(config_id),
    
    -- Attribute data
    attribute_path TEXT NOT NULL, -- Dot-notation path like 'component.props.variant'
    attribute_key TEXT NOT NULL,
    attribute_value JSONB, -- Supports any value type
    attribute_type TEXT, -- 'string', 'number', 'boolean', 'object', 'array'
    
    -- Drill-down support
    parent_attribute_id UUID REFERENCES crawled_attributes(id) ON DELETE CASCADE,
    depth INTEGER DEFAULT 0,
    
    -- Classification
    category TEXT, -- For grouping similar attributes
    tags TEXT[],
    
    -- Quality metrics
    confidence_score REAL DEFAULT 1.0,
    validation_status TEXT DEFAULT 'pending', -- 'pending', 'valid', 'invalid'
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawled_attr_source ON crawled_attributes(source_id, source_type);
CREATE INDEX idx_crawled_attr_path ON crawled_attributes(attribute_path);
CREATE INDEX idx_crawled_attr_parent ON crawled_attributes(parent_attribute_id);
CREATE INDEX idx_crawled_attr_config ON crawled_attributes(crawler_config_id);

-- Storybook instances with rich metadata
CREATE TABLE IF NOT EXISTS storybook_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id TEXT UNIQUE NOT NULL,
    
    url TEXT NOT NULL,
    title TEXT,
    version TEXT,
    framework TEXT, -- 'react', 'vue', 'angular', etc.
    
    -- Discovery metadata
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discovery_method TEXT, -- 'github', 'npm', 'manual', 'related'
    
    -- Quality metrics
    quality_score REAL DEFAULT 0,
    component_count INTEGER DEFAULT 0,
    story_count INTEGER DEFAULT 0,
    
    -- Configuration
    storybook_config JSONB DEFAULT '{}',
    addons JSONB DEFAULT '[]',
    
    -- Status
    crawl_status TEXT DEFAULT 'pending', -- 'pending', 'crawling', 'complete', 'error'
    last_crawled_at TIMESTAMP,
    
    -- Relationships
    source_repo TEXT,
    npm_package TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_storybook_url ON storybook_instances(url);
CREATE INDEX idx_storybook_framework ON storybook_instances(framework);
CREATE INDEX idx_storybook_status ON storybook_instances(crawl_status);

-- Components with semantic relationships
CREATE TABLE IF NOT EXISTS storybook_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id TEXT UNIQUE NOT NULL,
    
    instance_id TEXT REFERENCES storybook_instances(instance_id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    display_name TEXT,
    category TEXT, -- 'atom', 'molecule', 'organism', 'template', 'page'
    
    -- Component details
    description TEXT,
    props_schema JSONB DEFAULT '{}',
    default_props JSONB DEFAULT '{}',
    
    -- Code reference
    file_path TEXT,
    source_code TEXT,
    
    -- Semantic embedding
    embedding VECTOR(1536),
    
    -- Quality metrics
    completeness_score REAL DEFAULT 0,
    documentation_score REAL DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_component_instance ON storybook_components(instance_id);
CREATE INDEX idx_component_category ON storybook_components(category);
CREATE INDEX idx_component_embedding ON storybook_components USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- CODEBASE INDEXING AND ANALYSIS
-- ============================================================================

-- Code analysis sessions
CREATE TABLE IF NOT EXISTS code_analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    
    -- Session info
    repository TEXT NOT NULL,
    branch TEXT,
    commit_sha TEXT,
    
    -- Analysis scope
    analysis_type TEXT NOT NULL, -- 'full', 'incremental', 'targeted'
    file_patterns TEXT[],
    
    -- Results
    entities_found INTEGER DEFAULT 0,
    relationships_found INTEGER DEFAULT 0,
    issues_found INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'complete', 'error'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_repo ON code_analysis_sessions(repository);
CREATE INDEX idx_analysis_status ON code_analysis_sessions(status);

-- Code issues detected by analysis
CREATE TABLE IF NOT EXISTS code_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id TEXT UNIQUE NOT NULL,
    
    -- Issue classification
    severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
    category TEXT NOT NULL, -- 'bug', 'performance', 'security', 'style', 'documentation'
    
    -- Location
    file_path TEXT NOT NULL,
    line_start INTEGER,
    line_end INTEGER,
    
    -- Details
    title TEXT NOT NULL,
    description TEXT,
    suggestion TEXT,
    
    -- Related entities
    related_entity_id TEXT REFERENCES code_entities(entity_id),
    
    -- AI analysis
    ai_detected BOOLEAN DEFAULT false,
    ai_confidence REAL DEFAULT 0,
    
    -- Resolution
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'wont_fix'
    resolution TEXT,
    resolved_at TIMESTAMP,
    resolved_by TEXT,
    
    -- Git integration
    related_pr TEXT,
    related_commit TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_severity ON code_issues(severity);
CREATE INDEX idx_issues_status ON code_issues(status);
CREATE INDEX idx_issues_file ON code_issues(file_path);
CREATE INDEX idx_issues_ai ON code_issues(ai_detected);

-- ============================================================================
-- GIT WORKFLOW AUTOMATION
-- ============================================================================

-- Git branches managed by agents
CREATE TABLE IF NOT EXISTS agent_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id TEXT UNIQUE NOT NULL,
    
    branch_name TEXT NOT NULL,
    base_branch TEXT DEFAULT 'main',
    
    -- Purpose
    purpose TEXT NOT NULL, -- 'feature', 'bugfix', 'refactor', 'docs', 'chore'
    description TEXT,
    
    -- Related issues
    related_issues TEXT[],
    related_tickets TEXT[],
    
    -- Agent info
    created_by_agent TEXT,
    agent_type TEXT, -- 'code_fix', 'feature_gen', 'refactor', 'documentation'
    
    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'merged', 'abandoned'
    merge_status TEXT, -- 'pending', 'approved', 'rejected'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    merged_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_agent_branches_status ON agent_branches(status);
CREATE INDEX idx_agent_branches_agent ON agent_branches(created_by_agent);

-- Pull requests created by agents
CREATE TABLE IF NOT EXISTS agent_pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id TEXT UNIQUE NOT NULL,
    
    branch_id TEXT REFERENCES agent_branches(branch_id),
    
    -- PR details
    title TEXT NOT NULL,
    description TEXT,
    pr_number INTEGER,
    
    -- Changes
    files_changed INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    
    -- Review status
    review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'changes_requested', 'merged'
    reviewers TEXT[],
    
    -- Agent context
    agent_reasoning TEXT, -- Why the agent made these changes
    confidence_score REAL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    merged_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_agent_prs_status ON agent_pull_requests(review_status);
CREATE INDEX idx_agent_prs_branch ON agent_pull_requests(branch_id);

-- ============================================================================
-- AGENT MEMORY AND LEARNING
-- ============================================================================

-- Agent task history
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT UNIQUE NOT NULL,
    
    -- Task definition
    task_type TEXT NOT NULL, -- 'code_fix', 'feature_impl', 'refactor', 'review'
    task_description TEXT,
    
    -- Context
    context JSONB DEFAULT '{}',
    related_entities TEXT[], -- Entity IDs from code_entities
    
    -- Agent info
    agent_id TEXT,
    agent_type TEXT,
    
    -- Execution
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'complete', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Results
    success BOOLEAN,
    output JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Learning
    confidence_score REAL DEFAULT 0,
    quality_score REAL DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_tasks_type ON agent_tasks(task_type);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent_id);

-- Agent learning patterns
CREATE TABLE IF NOT EXISTS agent_learning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id TEXT UNIQUE NOT NULL,
    
    -- Pattern classification
    pattern_type TEXT NOT NULL, -- 'code_pattern', 'error_pattern', 'solution_pattern'
    pattern_name TEXT NOT NULL,
    
    -- Pattern definition
    pattern_signature TEXT, -- Code/error signature
    pattern_context JSONB DEFAULT '{}',
    
    -- Solution
    solution_template TEXT,
    solution_confidence REAL DEFAULT 0,
    
    -- Statistics
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Embedding for similarity search
    embedding VECTOR(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_type ON agent_learning_patterns(pattern_type);
CREATE INDEX idx_learning_embedding ON agent_learning_patterns USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- GRAPH TRAVERSAL AND ANALYSIS
-- ============================================================================

-- Materialized views for common graph queries
CREATE MATERIALIZED VIEW IF NOT EXISTS code_call_graph AS
SELECT 
    cr.from_entity_id,
    ce1.name as from_name,
    ce1.entity_type as from_type,
    cr.to_entity_id,
    ce2.name as to_name,
    ce2.entity_type as to_type,
    cr.relationship_type,
    cr.weight
FROM code_relationships cr
JOIN code_entities ce1 ON cr.from_entity_id = ce1.entity_id
JOIN code_entities ce2 ON cr.to_entity_id = ce2.entity_id
WHERE cr.relationship_type IN ('calls', 'uses', 'depends_on');

CREATE INDEX idx_call_graph_from ON code_call_graph(from_entity_id);
CREATE INDEX idx_call_graph_to ON code_call_graph(to_entity_id);

-- View for orphaned code (never called)
CREATE MATERIALIZED VIEW IF NOT EXISTS orphaned_code AS
SELECT 
    ce.entity_id,
    ce.name,
    ce.entity_type,
    ce.file_path
FROM code_entities ce
WHERE ce.entity_type = 'function'
AND NOT EXISTS (
    SELECT 1 FROM code_relationships cr 
    WHERE cr.to_entity_id = ce.entity_id 
    AND cr.relationship_type = 'calls'
)
AND ce.name NOT LIKE 'test%'
AND ce.name NOT LIKE '%Test';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to find related code entities
CREATE OR REPLACE FUNCTION find_related_entities(
    entity_id_param TEXT,
    max_depth INTEGER DEFAULT 2
) RETURNS TABLE (
    entity_id TEXT,
    name TEXT,
    entity_type TEXT,
    relationship_path TEXT[],
    distance INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE entity_graph AS (
        -- Base case: direct relationships
        SELECT 
            cr.to_entity_id as entity_id,
            ce.name,
            ce.entity_type,
            ARRAY[cr.relationship_type] as relationship_path,
            1 as distance
        FROM code_relationships cr
        JOIN code_entities ce ON cr.to_entity_id = ce.entity_id
        WHERE cr.from_entity_id = entity_id_param
        
        UNION ALL
        
        -- Recursive case: follow relationships
        SELECT 
            cr.to_entity_id,
            ce.name,
            ce.entity_type,
            eg.relationship_path || cr.relationship_type,
            eg.distance + 1
        FROM entity_graph eg
        JOIN code_relationships cr ON cr.from_entity_id = eg.entity_id
        JOIN code_entities ce ON cr.to_entity_id = ce.entity_id
        WHERE eg.distance < max_depth
    )
    SELECT DISTINCT * FROM entity_graph
    ORDER BY distance, name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate code complexity
CREATE OR REPLACE FUNCTION calculate_entity_complexity(
    entity_id_param TEXT
) RETURNS REAL AS $$
DECLARE
    complexity REAL := 0;
    incoming_count INTEGER;
    outgoing_count INTEGER;
BEGIN
    -- Count incoming relationships
    SELECT COUNT(*) INTO incoming_count
    FROM code_relationships
    WHERE to_entity_id = entity_id_param;
    
    -- Count outgoing relationships
    SELECT COUNT(*) INTO outgoing_count
    FROM code_relationships
    WHERE from_entity_id = entity_id_param;
    
    -- Simple complexity calculation
    complexity := (incoming_count * 0.5) + (outgoing_count * 1.0);
    
    RETURN complexity;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_code_entities_timestamp
BEFORE UPDATE ON code_entities
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_code_relationships_timestamp
BEFORE UPDATE ON code_relationships
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_storybook_instances_timestamp
BEFORE UPDATE ON storybook_instances
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_storybook_components_timestamp
BEFORE UPDATE ON storybook_components
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- INITIAL DATA / EXAMPLES
-- ============================================================================

-- Example crawler configuration for Storybook
INSERT INTO crawler_configurations (config_id, name, algorithm_type, extraction_rules, target_patterns, target_tables)
VALUES (
    'storybook-default',
    'Default Storybook Crawler',
    'storybook',
    '{
        "extract": ["components", "stories", "props", "addons", "config"],
        "component_schema": {
            "name": "string",
            "props": "object",
            "category": "string"
        }
    }'::jsonb,
    ARRAY['**/storybook/**', '**/?path=/story/**'],
    ARRAY['storybook_instances', 'storybook_components', 'crawled_attributes']
) ON CONFLICT (config_id) DO NOTHING;

-- Refresh materialized views periodically
-- This should be called by a cron job or scheduler
-- REFRESH MATERIALIZED VIEW CONCURRENTLY code_call_graph;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY orphaned_code;
