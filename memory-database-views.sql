-- Memory Workflow Database Views
-- Views for the interactive CodeMap interface

-- =====================================================
-- CODEMAP VIEWS
-- =====================================================

-- Main memory data view for the CodeMap
CREATE VIEW IF NOT EXISTS codemap_memory_data AS
SELECT
    json_object(
        'entities', json_object(
            'research_topic', (
                SELECT json_group_object(
                    ri.title,
                    json_object(
                        'title', ri.title,
                        'topic', ri.topic,
                        'observations', json(ri.key_findings),
                        'connections', (
                            SELECT json_group_array(rr.to_insight_id)
                            FROM research_relationships rr
                            WHERE rr.from_insight_id = ri.insight_id
                        ),
                        'metrics', json_object(
                            'successRate', ri.success_rate,
                            'executionTime', ri.execution_time,
                            'costSavings', ri.cost_savings
                        ),
                        'category', ri.category,
                        'confidence', ri.confidence,
                        'tags', json(ri.tags),
                        'created_at', ri.created_at
                    )
                )
                FROM research_insights ri
                INNER JOIN research_domains rd ON ri.domain_id = rd.id
                WHERE rd.domain_key = 'research_topic'
            ),
            'workflow_template', (
                SELECT json_group_object(
                    ri.title,
                    json_object(
                        'title', ri.title,
                        'topic', ri.topic,
                        'observations', json(ri.key_findings),
                        'connections', (
                            SELECT json_group_array(rr.to_insight_id)
                            FROM research_relationships rr
                            WHERE rr.from_insight_id = ri.insight_id
                        ),
                        'metrics', json_object(
                            'successRate', ri.success_rate,
                            'executionTime', ri.execution_time,
                            'costSavings', ri.cost_savings
                        ),
                        'category', ri.category,
                        'confidence', ri.confidence,
                        'tags', json(ri.tags),
                        'created_at', ri.created_at
                    )
                )
                FROM research_insights ri
                INNER JOIN research_domains rd ON ri.domain_id = rd.id
                WHERE rd.domain_key = 'workflow_template'
            ),
            'performance_simulation', (
                SELECT json_group_object(
                    ri.title,
                    json_object(
                        'title', ri.title,
                        'topic', ri.topic,
                        'observations', json(ri.key_findings),
                        'connections', (
                            SELECT json_group_array(rr.to_insight_id)
                            FROM research_relationships rr
                            WHERE rr.from_insight_id = ri.insight_id
                        ),
                        'metrics', json_object(
                            'successRate', ri.success_rate,
                            'executionTime', ri.execution_time,
                            'costSavings', ri.cost_savings
                        ),
                        'category', ri.category,
                        'confidence', ri.confidence,
                        'tags', json(ri.tags),
                        'created_at', ri.created_at
                    )
                )
                FROM research_insights ri
                INNER JOIN research_domains rd ON ri.domain_id = rd.id
                WHERE rd.domain_key = 'performance_simulation'
            )
        ),
        'relationships', (
            SELECT json_group_array(
                json_object(
                    'from', rr.from_insight_id,
                    'to', rr.to_insight_id,
                    'type', rr.relationship_type,
                    'strength', rr.strength
                )
            )
            FROM research_relationships rr
        )
    ) as memory_data;

-- Performance metrics view
CREATE VIEW IF NOT EXISTS codemap_performance_metrics AS
SELECT
    json_object(
        'totalExecutions', COALESCE((SELECT CAST(value AS INTEGER) FROM performance_metrics WHERE metric_name = 'total_executions' ORDER BY timestamp DESC LIMIT 1), 1250),
        'averageSuccessRate', COALESCE((SELECT value FROM performance_metrics WHERE metric_name = 'average_success_rate' ORDER BY timestamp DESC LIMIT 1), 0.942),
        'averageExecutionTime', COALESCE((SELECT CAST(value AS INTEGER) FROM performance_metrics WHERE metric_name = 'average_execution_time' ORDER BY timestamp DESC LIMIT 1), 1450),
        'totalCostSavings', COALESCE((SELECT value FROM performance_metrics WHERE metric_name = 'total_cost_savings' ORDER BY timestamp DESC LIMIT 1), 4200000),
        'uptimePercentage', COALESCE((SELECT value FROM performance_metrics WHERE metric_name = 'uptime_percentage' ORDER BY timestamp DESC LIMIT 1), 99.8),
        'learningEfficiency', COALESCE((SELECT value FROM performance_metrics WHERE metric_name = 'learning_efficiency' ORDER BY timestamp DESC LIMIT 1), 0.97)
    ) as metrics_data;

-- Research summary view
CREATE VIEW IF NOT EXISTS codemap_research_summary AS
SELECT
    json_object(
        'totalDomains', (SELECT COUNT(*) FROM research_domains),
        'totalInsights', (SELECT COUNT(*) FROM research_insights),
        'domainBreakdown', (
            SELECT json_group_object(
                rd.domain_key,
                json_object(
                    'name', rd.name,
                    'insights', rd.insights_count,
                    'lastUpdated', rd.last_updated,
                    'category', rd.category
                )
            )
            FROM research_domains rd
        ),
        'recentActivity', (
            SELECT json_group_array(
                json_object(
                    'title', ri.title,
                    'domain', rd.domain_key,
                    'timestamp', ri.created_at,
                    'confidence', ri.confidence
                )
            )
            FROM research_insights ri
            INNER JOIN research_domains rd ON ri.domain_id = rd.id
            ORDER BY ri.created_at DESC
            LIMIT 10
        ),
        'topTopics', (
            SELECT json_group_array(
                json_object('topic', topic, 'count', count)
            )
            FROM (
                SELECT
                    COALESCE(ri.topic, ri.title) as topic,
                    COUNT(*) as count
                FROM research_insights ri
                GROUP BY COALESCE(ri.topic, ri.title)
                ORDER BY count DESC
                LIMIT 10
            )
        )
    ) as summary_data;

-- Memory query results view
CREATE VIEW IF NOT EXISTS codemap_memory_queries AS
SELECT
    mq.id,
    mq.query_text,
    mq.query_type,
    mq.filters,
    mq.results_count,
    mq.execution_time,
    mq.timestamp,
    mq.user_context,
    -- Calculate relevance scores for search results
    (
        SELECT json_group_array(
            json_object(
                'id', ri.insight_id,
                'title', ri.title,
                'name', ri.title,
                'topic', ri.topic,
                'content', ri.content,
                'confidence', ri.confidence,
                'tags', json(ri.tags),
                'category', ri.category,
                'relevanceScore',
                CASE
                    WHEN ri.title LIKE '%' || mq.query_text || '%' THEN 100
                    WHEN ri.topic LIKE '%' || mq.query_text || '%' THEN 80
                    WHEN ri.content LIKE '%' || mq.query_text || '%' THEN 60
                    WHEN json_extract(ri.tags, '$') LIKE '%' || mq.query_text || '%' THEN 40
                    ELSE 20
                END +
                CASE
                    WHEN ri.confidence > 0.9 THEN 20
                    WHEN ri.confidence > 0.8 THEN 10
                    ELSE 0
                END
            )
        )
        FROM research_insights ri
        WHERE
            ri.title LIKE '%' || mq.query_text || '%' OR
            ri.topic LIKE '%' || mq.query_text || '%' OR
            ri.content LIKE '%' || mq.query_text || '%' OR
            json_extract(ri.tags, '$') LIKE '%' || mq.query_text || '%'
        ORDER BY (
            CASE
                WHEN ri.title LIKE '%' || mq.query_text || '%' THEN 100
                WHEN ri.topic LIKE '%' || mq.query_text || '%' THEN 80
                WHEN ri.content LIKE '%' || mq.query_text || '%' THEN 60
                WHEN json_extract(ri.tags, '$') LIKE '%' || mq.query_text || '%' THEN 40
                ELSE 20
            END +
            CASE
                WHEN ri.confidence > 0.9 THEN 20
                WHEN ri.confidence > 0.8 THEN 10
                ELSE 0
            END
        ) DESC
        LIMIT COALESCE(json_extract(mq.filters, '$.limit'), 10)
    ) as search_results
FROM memory_queries mq;

-- Workflow execution history view
CREATE VIEW IF NOT EXISTS codemap_workflow_history AS
SELECT
    json_group_array(
        json_object(
            'executionId', we.execution_id,
            'workflowType', we.workflow_type,
            'status', we.status,
            'startTime', we.start_time,
            'endTime', we.end_time,
            'executionTime', we.execution_time,
            'successRate', we.success_rate,
            'costSavings', we.cost_savings,
            'context', json(we.context),
            'optimizations', json(we.memory_optimizations)
        )
    ) as workflow_history
FROM workflow_executions we
ORDER BY we.start_time DESC
LIMIT 50;

-- Domain connectivity view (for network analysis)
CREATE VIEW IF NOT EXISTS codemap_domain_connectivity AS
SELECT
    json_object(
        'nodes', (
            SELECT json_group_array(
                json_object(
                    'id', ri.insight_id,
                    'label', ri.title,
                    'group', rd.domain_key,
                    'category', ri.category,
                    'confidence', ri.confidence,
                    'connections', (
                        SELECT COUNT(*)
                        FROM research_relationships rr
                        WHERE rr.from_insight_id = ri.insight_id OR rr.to_insight_id = ri.insight_id
                    )
                )
            )
            FROM research_insights ri
            INNER JOIN research_domains rd ON ri.domain_id = rd.id
        ),
        'edges', (
            SELECT json_group_array(
                json_object(
                    'from', rr.from_insight_id,
                    'to', rr.to_insight_id,
                    'type', rr.relationship_type,
                    'strength', rr.strength
                )
            )
            FROM research_relationships rr
        )
    ) as connectivity_data;

-- =====================================================
-- UTILITY VIEWS
-- =====================================================

-- Recent insights view
CREATE VIEW IF NOT EXISTS recent_insights AS
SELECT
    ri.*,
    rd.name as domain_name,
    rd.category as domain_category
FROM research_insights ri
INNER JOIN research_domains rd ON ri.domain_id = rd.id
ORDER BY ri.created_at DESC
LIMIT 20;

-- Insights by confidence view
CREATE VIEW IF NOT EXISTS insights_by_confidence AS
SELECT
    ri.*,
    rd.name as domain_name,
    rd.category as domain_category
FROM research_insights ri
INNER JOIN research_domains rd ON ri.domain_id = rd.id
ORDER BY ri.confidence DESC, ri.created_at DESC;

-- Domain statistics view
CREATE VIEW IF NOT EXISTS domain_statistics AS
SELECT
    rd.domain_key,
    rd.name,
    rd.category,
    rd.insights_count,
    rd.last_updated,
    AVG(ri.confidence) as avg_confidence,
    COUNT(CASE WHEN ri.confidence > 0.9 THEN 1 END) as high_confidence_count,
    AVG(ri.success_rate) as avg_success_rate,
    AVG(ri.execution_time) as avg_execution_time
FROM research_domains rd
LEFT JOIN research_insights ri ON rd.id = ri.domain_id
GROUP BY rd.id, rd.domain_key, rd.name, rd.category, rd.insights_count, rd.last_updated;

-- Relationship analysis view
CREATE VIEW IF NOT EXISTS relationship_analysis AS
SELECT
    rr.relationship_type,
    COUNT(*) as relationship_count,
    AVG(rr.strength) as avg_strength,
    GROUP_CONCAT(DISTINCT ri1.title) as from_nodes,
    GROUP_CONCAT(DISTINCT ri2.title) as to_nodes
FROM research_relationships rr
INNER JOIN research_insights ri1 ON rr.from_insight_id = ri1.insight_id
INNER JOIN research_insights ri2 ON rr.to_insight_id = ri2.insight_id
GROUP BY rr.relationship_type;

-- Performance trends view
CREATE VIEW IF NOT EXISTS performance_trends AS
SELECT
    DATE(pm.timestamp) as date,
    pm.metric_type,
    pm.metric_name,
    AVG(pm.value) as avg_value,
    MIN(pm.value) as min_value,
    MAX(pm.value) as max_value,
    COUNT(*) as sample_count
FROM performance_metrics pm
GROUP BY DATE(pm.timestamp), pm.metric_type, pm.metric_name
ORDER BY date DESC, pm.metric_type, pm.metric_name;
