-- Database Optimization Script
-- Optimizes schema maps and indexes for performance without requiring pg extension privileges.

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
         SELECT 'agent_sessions'::text AS table_name,
             $idx1$CREATE INDEX IF NOT EXISTS idx_agent_sessions_status_created ON agent_sessions(status, created_at DESC)$idx1$::text AS ddl
        UNION ALL
         SELECT 'agent_instances', $idx2$CREATE INDEX IF NOT EXISTS idx_agent_instances_session_status ON agent_instances(session_id, status)$idx2$
        UNION ALL
         SELECT 'agent_messages', $idx3$CREATE INDEX IF NOT EXISTS idx_agent_messages_session_created ON agent_messages(session_id, created_at DESC)$idx3$
        UNION ALL
         SELECT 'agent_tools', $idx4$CREATE INDEX IF NOT EXISTS idx_agent_tools_category_active ON agent_tools(category, is_active) WHERE is_active = true$idx4$
        UNION ALL
         SELECT 'agent_workflows', $idx5$CREATE INDEX IF NOT EXISTS idx_agent_workflows_type_active ON agent_workflows(workflow_type, is_active) WHERE is_active = true$idx5$
        UNION ALL
         SELECT 'workflow_steps', $idx6$CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_ordering ON workflow_steps(workflow_id, ordering)$idx6$
        UNION ALL
         SELECT 'agent_executions', $idx7$CREATE INDEX IF NOT EXISTS idx_agent_executions_status_started ON agent_executions(status, started_at DESC)$idx7$
        UNION ALL
         SELECT 'agent_sessions', $idx8$CREATE INDEX IF NOT EXISTS idx_agent_sessions_config_gin ON agent_sessions USING gin(configuration)$idx8$
        UNION ALL
         SELECT 'agent_instances', $idx9$CREATE INDEX IF NOT EXISTS idx_agent_instances_tools_gin ON agent_instances USING gin(tools_enabled)$idx9$
        UNION ALL
         SELECT 'agent_workflows', $idx10$CREATE INDEX IF NOT EXISTS idx_agent_workflows_config_gin ON agent_workflows USING gin(configuration)$idx10$
        UNION ALL
         SELECT 'agent_sessions', $idx11$CREATE INDEX IF NOT EXISTS idx_active_agent_sessions ON agent_sessions(created_at DESC) WHERE status != 'archived'$idx11$
        UNION ALL
         SELECT 'agent_instances', $idx12$CREATE INDEX IF NOT EXISTS idx_active_agent_instances ON agent_instances(created_at DESC) WHERE status = 'active'$idx12$
        UNION ALL
        SELECT 'agent_executions', $idx13$CREATE INDEX IF NOT EXISTS idx_recent_executions ON agent_executions(started_at DESC) WHERE started_at IS NOT NULL$idx13$
        UNION ALL
         SELECT 'agent_campaigns', $idx14$CREATE INDEX IF NOT EXISTS idx_campaigns_status_created ON agent_campaigns(status, created_at DESC)$idx14$
        UNION ALL
         SELECT 'data_streams', $idx15$CREATE INDEX IF NOT EXISTS idx_data_streams_campaign_status ON data_streams(campaign_id, status)$idx15$
    LOOP
        IF to_regclass('public.' || rec.table_name) IS NOT NULL THEN
            EXECUTE rec.ddl;
        ELSE
            RAISE NOTICE 'Skipping index creation on %: table not found.', rec.table_name;
        END IF;
    END LOOP;
END;
$$;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'agent_sessions',
        'agent_instances',
        'agent_messages',
        'agent_tools',
        'agent_services',
        'agent_workflows',
        'workflow_steps',
        'agent_executions',
        'agent_campaigns',
        'data_streams'
    ] LOOP
        IF to_regclass('public.' || tbl) IS NOT NULL THEN
            EXECUTE format('ANALYZE %I', tbl);
        ELSE
            RAISE NOTICE 'Skipping ANALYZE on %: table not found.', tbl;
        END IF;
    END LOOP;
END;
$$;
