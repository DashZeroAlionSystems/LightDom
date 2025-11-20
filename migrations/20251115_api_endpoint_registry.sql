-- ====================================================================
-- API Endpoint Registry and Service Composition System
-- ====================================================================
-- Purpose: Catalog all API endpoints with metadata for workflow composition
--          and enable modular service orchestration
-- Created: 2025-11-15
-- ====================================================================

-- ====================================================================
-- PART 1: API Endpoint Registry
-- ====================================================================

-- Core table to catalog all API endpoints
CREATE TABLE IF NOT EXISTS api_endpoints (
    id SERIAL PRIMARY KEY,
    endpoint_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Endpoint identification
    title VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL, -- e.g., /api/workflows/:id
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE, PATCH
    description TEXT,
    category VARCHAR(100), -- e.g., 'workflow', 'data-mining', 'blockchain'
    tags TEXT[],
    
    -- Technical details
    route_file VARCHAR(500), -- Source file location for modular imports
    handler_function VARCHAR(255), -- Function name in route file
    middleware JSONB DEFAULT '[]', -- Array of middleware functions
    
    -- Request/Response schema
    request_schema JSONB, -- JSON Schema for request body/params
    response_schema JSONB, -- JSON Schema for response
    query_params JSONB DEFAULT '[]', -- Array of query parameter definitions
    path_params JSONB DEFAULT '[]', -- Array of path parameter definitions
    headers JSONB DEFAULT '[]', -- Required/optional headers
    
    -- Documentation and examples
    example_request JSONB,
    example_response JSONB,
    curl_example TEXT,
    
    -- Service integration
    service_type VARCHAR(100), -- 'data-processor', 'ai-engine', 'database', etc.
    requires_auth BOOLEAN DEFAULT FALSE,
    rate_limit INTEGER, -- Requests per minute
    timeout_ms INTEGER DEFAULT 30000,
    
    -- Operational metadata
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    deprecated BOOLEAN DEFAULT FALSE,
    deprecation_note TEXT,
    
    -- Performance and monitoring
    avg_response_time_ms FLOAT,
    success_rate FLOAT,
    total_calls BIGINT DEFAULT 0,
    last_called_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_api_endpoints_path ON api_endpoints(path);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_method ON api_endpoints(method);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_category ON api_endpoints(category);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_tags ON api_endpoints USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_active ON api_endpoints(is_active);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_service_type ON api_endpoints(service_type);

-- ====================================================================
-- PART 2: Service Endpoint Bindings
-- ====================================================================

-- Link API endpoints to workflow services
CREATE TABLE IF NOT EXISTS service_endpoint_bindings (
    id SERIAL PRIMARY KEY,
    binding_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Relations
    service_id VARCHAR(255) REFERENCES workflow_services(service_id) ON DELETE CASCADE,
    endpoint_id VARCHAR(255) REFERENCES api_endpoints(endpoint_id) ON DELETE CASCADE,
    
    -- Binding configuration
    binding_order INTEGER DEFAULT 0, -- Order in service execution
    is_required BOOLEAN DEFAULT TRUE,
    condition JSONB, -- Conditional execution rules
    
    -- Data flow configuration
    input_mapping JSONB DEFAULT '{}', -- Map service inputs to endpoint params
    output_mapping JSONB DEFAULT '{}', -- Map endpoint response to service outputs
    transform_script TEXT, -- JavaScript for custom transformations
    
    -- Error handling
    retry_policy JSONB DEFAULT '{"maxRetries": 3, "backoff": "exponential"}',
    fallback_endpoint_id VARCHAR(255) REFERENCES api_endpoints(endpoint_id),
    on_error VARCHAR(50) DEFAULT 'continue', -- 'continue', 'stop', 'retry'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_endpoint_bindings_service ON service_endpoint_bindings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_endpoint_bindings_endpoint ON service_endpoint_bindings(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_service_endpoint_bindings_order ON service_endpoint_bindings(binding_order);

-- ====================================================================
-- PART 3: Workflow Endpoint Chains
-- ====================================================================

-- Define chains of endpoints that execute in sequence
CREATE TABLE IF NOT EXISTS workflow_endpoint_chains (
    id SERIAL PRIMARY KEY,
    chain_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflow_hierarchy(workflow_id) ON DELETE CASCADE,
    
    -- Chain metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    chain_type VARCHAR(100) DEFAULT 'sequential', -- 'sequential', 'parallel', 'conditional'
    
    -- Configuration
    endpoints JSONB NOT NULL, -- Ordered array of endpoint configs
    data_flow JSONB DEFAULT '{}', -- How data flows between endpoints
    
    -- Execution control
    timeout_ms INTEGER DEFAULT 60000,
    retry_strategy JSONB DEFAULT '{}',
    rollback_on_error BOOLEAN DEFAULT FALSE,
    
    -- Monitoring
    total_executions BIGINT DEFAULT 0,
    successful_executions BIGINT DEFAULT 0,
    failed_executions BIGINT DEFAULT 0,
    avg_execution_time_ms FLOAT,
    last_executed_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_endpoint_chains_workflow ON workflow_endpoint_chains(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_endpoint_chains_type ON workflow_endpoint_chains(chain_type);
CREATE INDEX IF NOT EXISTS idx_workflow_endpoint_chains_active ON workflow_endpoint_chains(is_active);

-- ====================================================================
-- PART 4: Workflow Wizard Configurations
-- ====================================================================

-- Store wizard configurations for workflow creation
CREATE TABLE IF NOT EXISTS workflow_wizard_configs (
    id SERIAL PRIMARY KEY,
    config_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Configuration metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    wizard_type VARCHAR(100) NOT NULL, -- 'service-composition', 'endpoint-chain', 'data-pipeline'
    
    -- Wizard steps and controls
    steps JSONB NOT NULL, -- Array of wizard step configurations
    form_schema JSONB NOT NULL, -- JSON Schema for form generation
    validation_rules JSONB DEFAULT '{}',
    
    -- Available components
    available_endpoints JSONB DEFAULT '[]', -- Filtered list of endpoints for this wizard
    available_services JSONB DEFAULT '[]', -- Filtered list of services
    presets JSONB DEFAULT '[]', -- Pre-configured templates
    
    -- UI configuration
    ui_config JSONB DEFAULT '{}', -- Layout, theme, custom components
    help_text JSONB DEFAULT '{}', -- Contextual help for each step
    
    -- Validation and constraints
    required_fields JSONB DEFAULT '[]',
    field_dependencies JSONB DEFAULT '{}',
    
    -- Output configuration
    output_template JSONB, -- Template for generated workflow
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_wizard_configs_category ON workflow_wizard_configs(category);
CREATE INDEX IF NOT EXISTS idx_workflow_wizard_configs_type ON workflow_wizard_configs(wizard_type);
CREATE INDEX IF NOT EXISTS idx_workflow_wizard_configs_active ON workflow_wizard_configs(is_active);

-- ====================================================================
-- PART 5: Service Module Registry
-- ====================================================================

-- Track modular service files for plug-and-play architecture
CREATE TABLE IF NOT EXISTS service_module_registry (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Module identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(100) NOT NULL, -- 'service', 'middleware', 'transformer', 'validator'
    category VARCHAR(100),
    
    -- File location
    file_path VARCHAR(500) NOT NULL,
    export_name VARCHAR(255), -- Named export from the file
    
    -- Dependencies
    dependencies JSONB DEFAULT '[]', -- Array of required npm packages
    peer_modules JSONB DEFAULT '[]', -- Other modules this depends on
    
    -- API surface
    exports JSONB DEFAULT '{}', -- Public API of this module
    config_schema JSONB, -- JSON Schema for module configuration
    
    -- Integration points
    provides_endpoints JSONB DEFAULT '[]', -- Endpoint IDs this module provides
    provides_services JSONB DEFAULT '[]', -- Service IDs this module provides
    event_hooks JSONB DEFAULT '{}', -- Events this module emits/listens to
    
    -- Versioning and compatibility
    version VARCHAR(20) DEFAULT '1.0.0',
    min_platform_version VARCHAR(20),
    max_platform_version VARCHAR(20),
    
    -- Status
    is_installed BOOLEAN DEFAULT TRUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    load_priority INTEGER DEFAULT 100, -- Lower numbers load first
    
    -- Metadata
    author VARCHAR(255),
    license VARCHAR(100),
    repository_url TEXT,
    documentation_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_module_registry_type ON service_module_registry(module_type);
CREATE INDEX IF NOT EXISTS idx_service_module_registry_category ON service_module_registry(category);
CREATE INDEX IF NOT EXISTS idx_service_module_registry_enabled ON service_module_registry(is_enabled);
CREATE INDEX IF NOT EXISTS idx_service_module_registry_priority ON service_module_registry(load_priority);

-- ====================================================================
-- PART 6: Endpoint Execution Logs
-- ====================================================================

-- Track endpoint execution for monitoring and debugging
CREATE TABLE IF NOT EXISTS endpoint_execution_logs (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Execution context
    endpoint_id VARCHAR(255) REFERENCES api_endpoints(endpoint_id),
    workflow_id VARCHAR(255) REFERENCES workflow_hierarchy(workflow_id),
    chain_id VARCHAR(255) REFERENCES workflow_endpoint_chains(chain_id),
    
    -- Request details
    request_method VARCHAR(10),
    request_path TEXT,
    request_params JSONB,
    request_body JSONB,
    request_headers JSONB,
    
    -- Response details
    response_status INTEGER,
    response_body JSONB,
    response_time_ms FLOAT,
    
    -- Execution metadata
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'timeout', 'cancelled'
    error_message TEXT,
    error_stack TEXT,
    
    -- Context
    user_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_endpoint_execution_logs_endpoint ON endpoint_execution_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_execution_logs_workflow ON endpoint_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_execution_logs_chain ON endpoint_execution_logs(chain_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_execution_logs_status ON endpoint_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_endpoint_execution_logs_started_at ON endpoint_execution_logs(started_at DESC);

-- ====================================================================
-- PART 7: Update Triggers
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_api_endpoints_updated_at 
    BEFORE UPDATE ON api_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_endpoint_bindings_updated_at 
    BEFORE UPDATE ON service_endpoint_bindings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_endpoint_chains_updated_at 
    BEFORE UPDATE ON workflow_endpoint_chains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_wizard_configs_updated_at 
    BEFORE UPDATE ON workflow_wizard_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_module_registry_updated_at 
    BEFORE UPDATE ON service_module_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- PART 8: Comments
-- ====================================================================

COMMENT ON TABLE api_endpoints IS 'Registry of all API endpoints with complete metadata for service composition';
COMMENT ON TABLE service_endpoint_bindings IS 'Links API endpoints to workflow services with data flow mappings';
COMMENT ON TABLE workflow_endpoint_chains IS 'Sequential or parallel chains of endpoints for complex workflows';
COMMENT ON TABLE workflow_wizard_configs IS 'Configuration-driven wizard definitions for workflow creation UI';
COMMENT ON TABLE service_module_registry IS 'Registry of modular service files for plug-and-play architecture';
COMMENT ON TABLE endpoint_execution_logs IS 'Execution logs for monitoring and debugging endpoint chains';

COMMENT ON COLUMN api_endpoints.route_file IS 'Source file path for modular import/export';
COMMENT ON COLUMN api_endpoints.request_schema IS 'JSON Schema for validating incoming requests';
COMMENT ON COLUMN api_endpoints.response_schema IS 'JSON Schema describing response structure';
COMMENT ON COLUMN service_endpoint_bindings.transform_script IS 'JavaScript code for custom data transformations';
COMMENT ON COLUMN workflow_endpoint_chains.endpoints IS 'Ordered array of endpoint configurations for execution';
COMMENT ON COLUMN workflow_wizard_configs.form_schema IS 'JSON Schema for generating wizard forms';
COMMENT ON COLUMN service_module_registry.exports IS 'Public API surface of the module';
