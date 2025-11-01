-- Initialize Knowledge Graph Database
-- This file is executed when the Postgres container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create a function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_nodes_search
ON knowledge_nodes USING gin(to_tsvector('english', label || ' ' || node_type));

-- Create a view for advanced analytics
CREATE OR REPLACE VIEW knowledge_graph_advanced_stats AS
SELECT
    (SELECT COUNT(*) FROM knowledge_nodes) as nodes,
    (SELECT COUNT(*) FROM knowledge_relationships) as relationships,
    (SELECT COUNT(DISTINCT node_type) FROM knowledge_nodes) as node_types,
    (SELECT COUNT(DISTINCT relationship_type) FROM knowledge_relationships) as relationship_types,
    (SELECT AVG(weight) FROM knowledge_relationships WHERE weight IS NOT NULL) as avg_relationship_weight,
    (SELECT json_agg(node_type_stats) FROM (
        SELECT node_type, COUNT(*) as count
        FROM knowledge_nodes
        GROUP BY node_type
        ORDER BY count DESC
    ) node_type_stats) as node_type_distribution,
    (SELECT json_agg(rel_type_stats) FROM (
        SELECT relationship_type, COUNT(*) as count
        FROM knowledge_relationships
        GROUP BY relationship_type
        ORDER BY count DESC
    ) rel_type_stats) as relationship_type_distribution;

-- Insert some initial knowledge graph data
INSERT INTO knowledge_nodes (node_id, node_type, label, properties) VALUES
    ('mcp_architecture', 'system', 'MCP Architecture', '{"description": "Model Context Protocol system architecture", "version": "1.0"}'),
    ('knowledge_graph', 'system', 'Knowledge Graph', '{"description": "Graph-based knowledge representation", "backend": "PostgreSQL"}'),
    ('sequential_thinking', 'capability', 'Sequential Thinking', '{"description": "Step-by-step reasoning capability", "mcp_server": "sequential-thinking"}'),
    ('memory_system', 'capability', 'Memory System', '{"description": "Persistent knowledge storage", "mcp_server": "memory"}'),
    ('postgres_integration', 'database', 'PostgreSQL Integration', '{"description": "Relational database for knowledge persistence", "version": "15"}')
ON CONFLICT (node_id) DO NOTHING;

INSERT INTO knowledge_relationships (relationship_id, from_node_id, to_node_id, relationship_type, properties) VALUES
    ('mcp_knowledge', 'mcp_architecture', 'knowledge_graph', 'utilizes', '{"strength": "high"}'),
    ('mcp_sequential', 'mcp_architecture', 'sequential_thinking', 'integrates', '{"strength": "high"}'),
    ('mcp_memory', 'mcp_architecture', 'memory_system', 'integrates', '{"strength": "high"}'),
    ('kg_postgres', 'knowledge_graph', 'postgres_integration', 'depends_on', '{"strength": "critical"}'),
    ('sequential_memory', 'sequential_thinking', 'memory_system', 'complements', '{"strength": "medium"}')
ON CONFLICT (relationship_id) DO NOTHING;
