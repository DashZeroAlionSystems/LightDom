-- ====================================================================
-- API Endpoint Registry Demo Data Seed
-- ====================================================================
-- Purpose: Populate the database with realistic demo data to demonstrate
--          the relationships between tables and how the system works
-- Created: 2025-11-15
-- Usage: Run after 20251115_api_endpoint_registry.sql migration
-- ====================================================================

-- Note: This assumes workflow-hierarchy-schema.sql has already been run
-- which creates the workflow_hierarchy and workflow_services tables

-- ====================================================================
-- PART 1: Create Demo Workflow Hierarchy
-- ====================================================================

-- Insert a parent workflow for our demo
INSERT INTO workflow_hierarchy (
    workflow_id, name, description, hierarchy_level, hierarchy_path, 
    workflow_type, category, status, version, is_template
) VALUES (
    'demo-data-pipeline-workflow',
    'Demo Data Pipeline',
    'A demonstration workflow showing how to chain data processing endpoints',
    0,
    '/demo-data-pipeline-workflow',
    'composite',
    'data-mining',
    'active',
    '1.0.0',
    false
) ON CONFLICT (workflow_id) DO NOTHING;

-- Insert a workflow service that will use our endpoints
INSERT INTO workflow_services (
    service_id, workflow_id, name, description, service_type,
    bundled_endpoints, is_active
) VALUES (
    'demo-etl-service',
    'demo-data-pipeline-workflow',
    'Demo ETL Service',
    'Extract, Transform, and Load data through multiple API endpoints',
    'data-processor',
    '[]'::jsonb,  -- Will be populated by bindings
    true
) ON CONFLICT (service_id) DO NOTHING;

-- ====================================================================
-- PART 2: Create Demo API Endpoints
-- ====================================================================

-- Endpoint 1: Fetch Data
INSERT INTO api_endpoints (
    endpoint_id, title, path, method, description, category, tags,
    route_file, handler_function,
    request_schema, response_schema,
    query_params, path_params,
    example_request, example_response,
    curl_example,
    service_type, requires_auth, rate_limit, timeout_ms,
    is_public, is_active, version
) VALUES (
    'demo-fetch-data',
    'Fetch Raw Data',
    '/api/data/fetch',
    'GET',
    'Fetches raw data from a data source for processing',
    'data-mining',
    ARRAY['data', 'fetch', 'extract'],
    'api/data-mining-routes.js',
    'fetchRawData',
    '{"type": "object", "properties": {"source": {"type": "string"}}}'::jsonb,
    '{"type": "object", "properties": {"success": {"type": "boolean"}, "data": {"type": "array"}}}'::jsonb,
    '[{"name": "source", "type": "string", "required": true, "description": "Data source identifier"}]'::jsonb,
    '[]'::jsonb,
    '{"method": "GET", "path": "/api/data/fetch?source=database"}'::jsonb,
    '{"success": true, "data": [{"id": 1, "value": "sample"}]}'::jsonb,
    'curl -X GET "http://localhost:3001/api/data/fetch?source=database"',
    'data-processor',
    false,
    100,
    30000,
    true,
    true,
    '1.0.0'
) ON CONFLICT (endpoint_id) DO NOTHING;

-- Endpoint 2: Transform Data
INSERT INTO api_endpoints (
    endpoint_id, title, path, method, description, category, tags,
    route_file, handler_function,
    request_schema, response_schema,
    path_params,
    example_request, example_response,
    curl_example,
    service_type, requires_auth, rate_limit, timeout_ms,
    is_public, is_active, version
) VALUES (
    'demo-transform-data',
    'Transform Data',
    '/api/data/transform',
    'POST',
    'Transforms raw data into a structured format',
    'data-mining',
    ARRAY['data', 'transform', 'process'],
    'api/data-mining-routes.js',
    'transformData',
    '{"type": "object", "properties": {"data": {"type": "array"}, "rules": {"type": "object"}}}'::jsonb,
    '{"type": "object", "properties": {"success": {"type": "boolean"}, "transformedData": {"type": "array"}}}'::jsonb,
    '[]'::jsonb,
    '{"method": "POST", "path": "/api/data/transform", "body": {"data": [{"id": 1}], "rules": {"format": "json"}}}'::jsonb,
    '{"success": true, "transformedData": [{"id": 1, "processed": true}]}'::jsonb,
    'curl -X POST "http://localhost:3001/api/data/transform" -H "Content-Type: application/json" -d ''{"data": [{"id": 1}]}''',
    'data-processor',
    false,
    50,
    45000,
    true,
    true,
    '1.0.0'
) ON CONFLICT (endpoint_id) DO NOTHING;

-- Endpoint 3: Save Results
INSERT INTO api_endpoints (
    endpoint_id, title, path, method, description, category, tags,
    route_file, handler_function,
    request_schema, response_schema,
    example_request, example_response,
    curl_example,
    service_type, requires_auth, rate_limit, timeout_ms,
    is_public, is_active, version
) VALUES (
    'demo-save-results',
    'Save Processed Results',
    '/api/data/save',
    'POST',
    'Saves processed data to the database',
    'data-mining',
    ARRAY['data', 'save', 'load'],
    'api/data-mining-routes.js',
    'saveResults',
    '{"type": "object", "properties": {"data": {"type": "array"}, "destination": {"type": "string"}}}'::jsonb,
    '{"type": "object", "properties": {"success": {"type": "boolean"}, "saved": {"type": "integer"}}}'::jsonb,
    '{"method": "POST", "path": "/api/data/save", "body": {"data": [{"id": 1}], "destination": "database"}}'::jsonb,
    '{"success": true, "saved": 1}'::jsonb,
    'curl -X POST "http://localhost:3001/api/data/save" -H "Content-Type: application/json" -d ''{"data": [{"id": 1}]}''',
    'database',
    true,
    25,
    60000,
    false,
    true,
    '1.0.0'
) ON CONFLICT (endpoint_id) DO NOTHING;

-- Endpoint 4: Workflow Status Check
INSERT INTO api_endpoints (
    endpoint_id, title, path, method, description, category, tags,
    route_file, handler_function,
    request_schema, response_schema,
    path_params,
    example_request, example_response,
    curl_example,
    service_type, requires_auth, rate_limit, timeout_ms,
    is_public, is_active, version
) VALUES (
    'demo-workflow-status',
    'Check Workflow Status',
    '/api/workflows/:workflowId/status',
    'GET',
    'Checks the current status of a workflow execution',
    'workflow',
    ARRAY['workflow', 'status', 'monitor'],
    'api/workflow-routes.js',
    'getWorkflowStatus',
    '{"type": "object"}'::jsonb,
    '{"type": "object", "properties": {"workflowId": {"type": "string"}, "status": {"type": "string"}, "progress": {"type": "number"}}}'::jsonb,
    '[{"name": "workflowId", "type": "string", "required": true}]'::jsonb,
    '{"method": "GET", "path": "/api/workflows/demo-workflow-123/status"}'::jsonb,
    '{"workflowId": "demo-workflow-123", "status": "running", "progress": 0.65}'::jsonb,
    'curl -X GET "http://localhost:3001/api/workflows/demo-workflow-123/status"',
    'workflow-engine',
    false,
    200,
    5000,
    true,
    true,
    '1.0.0'
) ON CONFLICT (endpoint_id) DO NOTHING;

-- ====================================================================
-- PART 3: Bind Endpoints to Service (Service Composition)
-- ====================================================================

-- Binding 1: Fetch Data (First step)
INSERT INTO service_endpoint_bindings (
    binding_id, service_id, endpoint_id,
    binding_order, is_required,
    input_mapping, output_mapping,
    transform_script,
    retry_policy, on_error,
    is_active
) VALUES (
    'demo-binding-fetch',
    'demo-etl-service',
    'demo-fetch-data',
    0,  -- First in sequence
    true,
    '{}'::jsonb,  -- No input mapping for first step
    '{"rawData": "data"}'::jsonb,  -- Map 'data' from response to 'rawData' in context
    NULL,
    '{"maxRetries": 3, "backoff": "exponential", "initialDelay": 1000}'::jsonb,
    'stop',
    true
) ON CONFLICT (binding_id) DO NOTHING;

-- Binding 2: Transform Data (Second step)
INSERT INTO service_endpoint_bindings (
    binding_id, service_id, endpoint_id,
    binding_order, is_required,
    input_mapping, output_mapping,
    transform_script,
    retry_policy, on_error,
    is_active
) VALUES (
    'demo-binding-transform',
    'demo-etl-service',
    'demo-transform-data',
    1,  -- Second in sequence
    true,
    '{"data": "rawData"}'::jsonb,  -- Map 'rawData' from context to 'data' parameter
    '{"processedData": "transformedData"}'::jsonb,  -- Map response to context
    'data.rules = { format: "json", validate: true }; return data;',
    '{"maxRetries": 2, "backoff": "linear", "initialDelay": 2000}'::jsonb,
    'retry',
    true
) ON CONFLICT (binding_id) DO NOTHING;

-- Binding 3: Save Results (Third step)
INSERT INTO service_endpoint_bindings (
    binding_id, service_id, endpoint_id,
    binding_order, is_required,
    input_mapping, output_mapping,
    transform_script,
    retry_policy, on_error, fallback_endpoint_id,
    is_active
) VALUES (
    'demo-binding-save',
    'demo-etl-service',
    'demo-save-results',
    2,  -- Third in sequence
    true,
    '{"data": "processedData", "destination": "database"}'::jsonb,
    '{"savedCount": "saved"}'::jsonb,
    NULL,
    '{"maxRetries": 5, "backoff": "exponential", "initialDelay": 1000}'::jsonb,
    'retry',
    NULL,  -- Could add a fallback endpoint here
    true
) ON CONFLICT (binding_id) DO NOTHING;

-- ====================================================================
-- PART 4: Create Endpoint Chains
-- ====================================================================

-- Chain 1: Sequential ETL Chain
INSERT INTO workflow_endpoint_chains (
    chain_id, workflow_id, name, description, chain_type,
    endpoints, data_flow,
    timeout_ms, retry_strategy, rollback_on_error,
    is_active
) VALUES (
    'demo-etl-chain',
    'demo-data-pipeline-workflow',
    'Demo ETL Chain',
    'Sequential chain demonstrating Extract-Transform-Load pattern',
    'sequential',
    '[
        {
            "endpoint_id": "demo-fetch-data",
            "config": {
                "output_mapping": {"rawData": "data"},
                "timeout": 30000
            }
        },
        {
            "endpoint_id": "demo-transform-data",
            "config": {
                "input_mapping": {"data": "rawData"},
                "output_mapping": {"processedData": "transformedData"},
                "timeout": 45000
            }
        },
        {
            "endpoint_id": "demo-save-results",
            "config": {
                "input_mapping": {"data": "processedData"},
                "output_mapping": {"savedCount": "saved"},
                "timeout": 60000
            }
        }
    ]'::jsonb,
    '{
        "demo-fetch-data": {"output": "rawData"},
        "demo-transform-data": {"input": "rawData", "output": "processedData"},
        "demo-save-results": {"input": "processedData"}
    }'::jsonb,
    180000,  -- 3 minutes total timeout
    '{"maxRetries": 2, "backoff": "exponential"}'::jsonb,
    false,
    true
) ON CONFLICT (chain_id) DO NOTHING;

-- Chain 2: Parallel Processing Chain
INSERT INTO workflow_endpoint_chains (
    chain_id, workflow_id, name, description, chain_type,
    endpoints, data_flow,
    timeout_ms, retry_strategy, rollback_on_error,
    is_active
) VALUES (
    'demo-parallel-chain',
    'demo-data-pipeline-workflow',
    'Demo Parallel Processing Chain',
    'Demonstrates parallel execution of independent endpoints',
    'parallel',
    '[
        {
            "endpoint_id": "demo-transform-data",
            "config": {
                "input_mapping": {"data": "inputData"},
                "output_mapping": {"result1": "transformedData"}
            }
        },
        {
            "endpoint_id": "demo-workflow-status",
            "config": {
                "input_mapping": {"workflowId": "currentWorkflowId"},
                "output_mapping": {"status": "status"}
            }
        }
    ]'::jsonb,
    '{
        "parallel_execution": true,
        "merge_results": true
    }'::jsonb,
    60000,
    '{"maxRetries": 1}'::jsonb,
    false,
    true
) ON CONFLICT (chain_id) DO NOTHING;

-- ====================================================================
-- PART 5: Create Workflow Wizard Configurations
-- ====================================================================

-- Wizard Config for Data Mining Workflows
INSERT INTO workflow_wizard_configs (
    config_id, name, description, category, wizard_type,
    steps, form_schema, validation_rules,
    available_endpoints, available_services, presets,
    ui_config, help_text,
    required_fields, field_dependencies,
    is_active, version
) VALUES (
    'demo-data-mining-wizard',
    'Data Mining Workflow Wizard',
    'Create data mining workflows using available endpoints',
    'data-mining',
    'service-composition',
    '[
        {
            "id": "workflow-info",
            "title": "Workflow Information",
            "description": "Enter basic workflow details",
            "fields": ["name", "description"]
        },
        {
            "id": "select-endpoints",
            "title": "Select Data Processing Endpoints",
            "description": "Choose endpoints for your data pipeline",
            "fields": ["endpoints"],
            "component": "EndpointSelector"
        },
        {
            "id": "configure-flow",
            "title": "Configure Data Flow",
            "description": "Map data between endpoints",
            "fields": ["data_mappings"]
        },
        {
            "id": "review",
            "title": "Review & Create",
            "description": "Review your workflow configuration",
            "component": "WorkflowPreview"
        }
    ]'::jsonb,
    '{
        "type": "object",
        "required": ["name", "endpoints"],
        "properties": {
            "name": {"type": "string", "minLength": 3},
            "description": {"type": "string"},
            "endpoints": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "endpoint_id": {"type": "string"},
                        "order": {"type": "integer"}
                    }
                }
            },
            "data_mappings": {"type": "object"}
        }
    }'::jsonb,
    '{"name": {"pattern": "^[a-zA-Z0-9\\s-_]+$"}}'::jsonb,
    '["demo-fetch-data", "demo-transform-data", "demo-save-results"]'::jsonb,
    '["demo-etl-service"]'::jsonb,
    '[
        {
            "name": "Basic ETL",
            "description": "Simple Extract-Transform-Load pipeline",
            "config": {
                "endpoints": [
                    {"endpoint_id": "demo-fetch-data", "order": 0},
                    {"endpoint_id": "demo-transform-data", "order": 1},
                    {"endpoint_id": "demo-save-results", "order": 2}
                ]
            }
        }
    ]'::jsonb,
    '{"theme": "default", "layout": "stepper", "showProgress": true}'::jsonb,
    '{
        "workflow-info": {
            "title": "Get Started",
            "content": "Name your workflow and provide a description",
            "tips": ["Use a descriptive name", "Explain what the workflow does"]
        },
        "select-endpoints": {
            "title": "Choose Your Endpoints",
            "content": "Select the API endpoints to include in your workflow",
            "tips": ["Order matters for sequential execution", "Preview each endpoint"]
        }
    }'::jsonb,
    '["name", "endpoints"]'::jsonb,
    '{}'::jsonb,
    true,
    '1.0.0'
) ON CONFLICT (config_id) DO NOTHING;

-- ====================================================================
-- PART 6: Add Sample Execution Logs (showing the system in use)
-- ====================================================================

-- Sample execution log 1: Successful fetch
INSERT INTO endpoint_execution_logs (
    execution_id, endpoint_id, workflow_id, chain_id,
    request_method, request_path, request_params, request_body,
    response_status, response_body, response_time_ms,
    started_at, completed_at, status
) VALUES (
    'demo-exec-001',
    'demo-fetch-data',
    'demo-data-pipeline-workflow',
    'demo-etl-chain',
    'GET',
    '/api/data/fetch',
    '{"source": "database"}'::jsonb,
    '{}'::jsonb,
    200,
    '{"success": true, "data": [{"id": 1, "value": "sample"}]}'::jsonb,
    234.56,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes' + INTERVAL '234 milliseconds',
    'success'
) ON CONFLICT (execution_id) DO NOTHING;

-- Sample execution log 2: Successful transform
INSERT INTO endpoint_execution_logs (
    execution_id, endpoint_id, workflow_id, chain_id,
    request_method, request_path, request_body,
    response_status, response_body, response_time_ms,
    started_at, completed_at, status
) VALUES (
    'demo-exec-002',
    'demo-transform-data',
    'demo-data-pipeline-workflow',
    'demo-etl-chain',
    'POST',
    '/api/data/transform',
    '{"data": [{"id": 1, "value": "sample"}]}'::jsonb,
    200,
    '{"success": true, "transformedData": [{"id": 1, "value": "sample", "processed": true}]}'::jsonb,
    456.78,
    NOW() - INTERVAL '4 minutes',
    NOW() - INTERVAL '4 minutes' + INTERVAL '456 milliseconds',
    'success'
) ON CONFLICT (execution_id) DO NOTHING;

-- Sample execution log 3: Successful save
INSERT INTO endpoint_execution_logs (
    execution_id, endpoint_id, workflow_id, chain_id,
    request_method, request_path, request_body,
    response_status, response_body, response_time_ms,
    started_at, completed_at, status
) VALUES (
    'demo-exec-003',
    'demo-save-results',
    'demo-data-pipeline-workflow',
    'demo-etl-chain',
    'POST',
    '/api/data/save',
    '{"data": [{"id": 1, "value": "sample", "processed": true}], "destination": "database"}'::jsonb,
    200,
    '{"success": true, "saved": 1}'::jsonb,
    123.45,
    NOW() - INTERVAL '3 minutes',
    NOW() - INTERVAL '3 minutes' + INTERVAL '123 milliseconds',
    'success'
) ON CONFLICT (execution_id) DO NOTHING;

-- Update chain execution statistics
UPDATE workflow_endpoint_chains
SET 
    total_executions = 1,
    successful_executions = 1,
    failed_executions = 0,
    avg_execution_time_ms = 814.79,  -- Sum of all execution times
    last_executed_at = NOW() - INTERVAL '3 minutes'
WHERE chain_id = 'demo-etl-chain';

-- ====================================================================
-- PART 7: Add Service Module Registry Examples
-- ====================================================================

INSERT INTO service_module_registry (
    module_id, name, description, module_type, category,
    file_path, export_name,
    dependencies, provides_endpoints, provides_services,
    version, is_installed, is_enabled, load_priority
) VALUES (
    'demo-data-mining-module',
    'Data Mining Module',
    'Provides data mining and processing capabilities',
    'service',
    'data-mining',
    'services/data-mining-instance-service.js',
    'DataMiningInstanceService',
    '["axios", "lodash"]'::jsonb,
    '["demo-fetch-data", "demo-transform-data"]'::jsonb,
    '["demo-etl-service"]'::jsonb,
    '1.0.0',
    true,
    true,
    100
) ON CONFLICT (module_id) DO NOTHING;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Demo Data Seeded Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary of Demo Data:';
    RAISE NOTICE '   * 1 Workflow (demo-data-pipeline-workflow)';
    RAISE NOTICE '   * 1 Service (demo-etl-service)';
    RAISE NOTICE '   * 4 Endpoints (fetch, transform, save, status)';
    RAISE NOTICE '   * 3 Service Bindings (ETL pipeline)';
    RAISE NOTICE '   * 2 Endpoint Chains (sequential & parallel)';
    RAISE NOTICE '   * 1 Wizard Configuration (data-mining)';
    RAISE NOTICE '   * 3 Execution Logs (successful runs)';
    RAISE NOTICE '   * 1 Service Module (data-mining)';
    RAISE NOTICE '';
    RAISE NOTICE 'View the data:';
    RAISE NOTICE '   SELECT * FROM api_endpoints;';
    RAISE NOTICE '   SELECT * FROM service_endpoint_bindings;';
    RAISE NOTICE '   SELECT * FROM workflow_endpoint_chains;';
    RAISE NOTICE '   SELECT * FROM endpoint_execution_logs;';
    RAISE NOTICE '';
    RAISE NOTICE 'Test the relationships:';
    RAISE NOTICE '   -- See how endpoints connect to services';
    RAISE NOTICE '   SELECT ae.title, seb.binding_order, ws.name as service_name';
    RAISE NOTICE '   FROM api_endpoints ae';
    RAISE NOTICE '   JOIN service_endpoint_bindings seb ON ae.endpoint_id = seb.endpoint_id';
    RAISE NOTICE '   JOIN workflow_services ws ON seb.service_id = ws.service_id;';
    RAISE NOTICE '';
END $$;
