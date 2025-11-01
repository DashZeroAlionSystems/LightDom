-- Memory Workflow Database Schema
-- SQLite database for persistent memory storage and research data management

-- =====================================================
-- TABLES
-- =====================================================

-- Research Domains Table
CREATE TABLE IF NOT EXISTS research_domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    insights_count INTEGER DEFAULT 0,
    last_updated DATETIME
);

-- Research Insights Table
CREATE TABLE IF NOT EXISTS research_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_id INTEGER NOT NULL,
    insight_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    topic TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'uncategorized',
    confidence REAL DEFAULT 0.8 CHECK(confidence >= 0.0 AND confidence <= 1.0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Performance metrics
    success_rate REAL,
    execution_time INTEGER,
    cost_savings REAL,

    -- Metadata
    tags TEXT, -- JSON array of tags
    key_findings TEXT, -- JSON array of key findings
    source TEXT DEFAULT 'cascade_ai',
    version TEXT DEFAULT '1.0',

    FOREIGN KEY (domain_id) REFERENCES research_domains(id) ON DELETE CASCADE
);

-- Research Relationships Table
CREATE TABLE IF NOT EXISTS research_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_insight_id TEXT NOT NULL,
    to_insight_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    strength REAL DEFAULT 0.8 CHECK(strength >= 0.0 AND strength <= 1.0),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_insight_id) REFERENCES research_insights(insight_id) ON DELETE CASCADE,
    FOREIGN KEY (to_insight_id) REFERENCES research_insights(insight_id) ON DELETE CASCADE
);

-- Memory Sessions Table (tracks usage and learning)
CREATE TABLE IF NOT EXISTS memory_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    context TEXT, -- JSON object with session context
    operations_count INTEGER DEFAULT 0,
    insights_accessed INTEGER DEFAULT 0,
    queries_executed INTEGER DEFAULT 0
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id TEXT UNIQUE NOT NULL,
    workflow_type TEXT NOT NULL,
    context TEXT, -- JSON object
    requirements TEXT, -- JSON object
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed')),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    execution_time INTEGER, -- in milliseconds
    success_rate REAL,
    cost_savings REAL,
    error_message TEXT,
    memory_optimizations TEXT -- JSON array of applied optimizations
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    context TEXT -- JSON object with additional context
);

-- Memory Queries Table (tracks search and retrieval patterns)
CREATE TABLE IF NOT EXISTS memory_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_type TEXT DEFAULT 'search' CHECK(query_type IN ('search', 'retrieval', 'filter')),
    filters TEXT, -- JSON object
    results_count INTEGER DEFAULT 0,
    execution_time INTEGER, -- in milliseconds
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_context TEXT -- JSON object
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Research Insights indexes
CREATE INDEX IF NOT EXISTS idx_insights_domain ON research_insights(domain_id);
CREATE INDEX IF NOT EXISTS idx_insights_topic ON research_insights(topic);
CREATE INDEX IF NOT EXISTS idx_insights_category ON research_insights(category);
CREATE INDEX IF NOT EXISTS idx_insights_confidence ON research_insights(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_insights_created ON research_insights(created_at DESC);

-- Research Relationships indexes
CREATE INDEX IF NOT EXISTS idx_relationships_from ON research_relationships(from_insight_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON research_relationships(to_insight_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON research_relationships(relationship_type);

-- Workflow Executions indexes
CREATE INDEX IF NOT EXISTS idx_executions_type ON workflow_executions(workflow_type);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_start ON workflow_executions(start_time DESC);

-- Performance Metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics(timestamp DESC);

-- Memory Queries indexes
CREATE INDEX IF NOT EXISTS idx_queries_type ON memory_queries(query_type);
CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON memory_queries(timestamp DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update research_domains insights_count when insights are added/removed
CREATE TRIGGER IF NOT EXISTS update_domain_insights_count
    AFTER INSERT ON research_insights
BEGIN
    UPDATE research_domains
    SET insights_count = (
        SELECT COUNT(*) FROM research_insights WHERE domain_id = NEW.domain_id
    ),
    last_updated = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.domain_id;
END;

CREATE TRIGGER IF NOT EXISTS update_domain_insights_count_delete
    AFTER DELETE ON research_insights
BEGIN
    UPDATE research_domains
    SET insights_count = (
        SELECT COUNT(*) FROM research_insights WHERE domain_id = OLD.domain_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.domain_id;
END;

-- Update timestamp on insight updates
CREATE TRIGGER IF NOT EXISTS update_insight_timestamp
    AFTER UPDATE ON research_insights
BEGIN
    UPDATE research_insights SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update domain timestamp when domain is updated
CREATE TRIGGER IF NOT EXISTS update_domain_timestamp
    AFTER UPDATE ON research_domains
BEGIN
    UPDATE research_domains SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
