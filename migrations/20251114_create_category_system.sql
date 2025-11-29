-- Migration: Create Category Management System with Auto-CRUD Generation
-- Description: Add categories table with auto-generate CRUD API functionality
-- Created: 2025-11-14

-- Categories table - stores all category definitions
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_type VARCHAR(100) NOT NULL CHECK (category_type IN (
        'workflow', 
        'service', 
        'data_stream', 
        'neural_network', 
        'tensorflow', 
        'scraper', 
        'data_mining', 
        'seeder', 
        'campaign', 
        'client_management'
    )),
    parent_category_id VARCHAR(255) REFERENCES categories(category_id) ON DELETE SET NULL,
    auto_generate_crud_api BOOLEAN DEFAULT TRUE,
    api_config JSONB DEFAULT '{
        "crud_enabled": true,
        "use_cases": [],
        "search_fields": ["name", "description"],
        "filter_fields": ["status", "category_type"],
        "api_enabled": true,
        "pagination": {
            "enabled": true,
            "default_limit": 50,
            "max_limit": 100
        },
        "authentication": {
            "required": false,
            "roles": []
        }
    }'::jsonb,
    schema_definition JSONB DEFAULT '{
        "fields": [
            {"name": "name", "type": "string", "required": true},
            {"name": "description", "type": "text", "required": false},
            {"name": "status", "type": "string", "default": "active"}
        ]
    }'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    icon VARCHAR(255),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Category items table - stores actual items for each category
CREATE TABLE IF NOT EXISTS category_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(255) UNIQUE NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(category_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    _meta JSONB DEFAULT '{}'::jsonb
);

-- API routes table - stores auto-generated API route information
CREATE TABLE IF NOT EXISTS auto_generated_api_routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(255) UNIQUE NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(category_id) ON DELETE CASCADE,
    base_path VARCHAR(500) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    crud_enabled BOOLEAN DEFAULT TRUE,
    use_cases JSONB DEFAULT '[]'::jsonb,
    endpoints JSONB DEFAULT '[]'::jsonb,
    swagger_spec JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    last_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category configuration table - stores system-wide configuration
CREATE TABLE IF NOT EXISTS category_system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system configuration
INSERT INTO category_system_config (config_key, config_value, description, is_system) VALUES
('auto_crud_generation', '{"enabled": true, "auto_mount": true, "regenerate_on_update": true}'::jsonb, 'Global auto-CRUD generation settings', true),
('swagger_integration', '{"enabled": true, "auto_document": true, "ui_path": "/api-docs"}'::jsonb, 'Swagger/OpenAPI integration settings', true),
('default_api_config', '{
    "crud_enabled": true,
    "pagination": {"enabled": true, "default_limit": 50, "max_limit": 100},
    "authentication": {"required": false, "roles": []},
    "rate_limiting": {"enabled": false, "requests_per_minute": 100}
}'::jsonb, 'Default API configuration for new categories', true)
ON CONFLICT (config_key) DO NOTHING;

-- Insert default categories for testing
INSERT INTO categories (category_id, name, display_name, description, category_type, auto_generate_crud_api) VALUES
('workflows', 'workflows', 'Workflows', 'Workflow automation and orchestration', 'workflow', true),
('services', 'services', 'Services', 'Microservices and API services', 'service', true),
('data-streams', 'data_streams', 'Data Streams', 'Real-time data streaming pipelines', 'data_stream', true),
('neural-networks', 'neural_networks', 'Neural Networks', 'AI/ML neural network models', 'neural_network', true),
('tensorflow-models', 'tensorflow_models', 'TensorFlow Models', 'TensorFlow model management', 'tensorflow', true),
('scrapers', 'scrapers', 'Scrapers', 'Web scraping and data extraction', 'scraper', true),
('data-mining', 'data_mining_jobs', 'Data Mining', 'Data mining and analytics jobs', 'data_mining', true),
('seeders', 'seeders', 'Seeders', 'Database and content seeders', 'seeder', true),
('campaigns', 'campaigns', 'Campaigns', 'Marketing and SEO campaigns', 'campaign', true),
('client-management', 'client_management', 'Client Management', 'Client and customer management', 'client_management', true)
ON CONFLICT (category_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_auto_crud ON categories(auto_generate_crud_api) WHERE auto_generate_crud_api = TRUE;
CREATE INDEX IF NOT EXISTS idx_category_items_category ON category_items(category_id);
CREATE INDEX IF NOT EXISTS idx_category_items_status ON category_items(status);
CREATE INDEX IF NOT EXISTS idx_api_routes_category ON auto_generated_api_routes(category_id);
CREATE INDEX IF NOT EXISTS idx_api_routes_status ON auto_generated_api_routes(status);
CREATE INDEX IF NOT EXISTS idx_api_routes_table ON auto_generated_api_routes(table_name);

-- Create trigger function to auto-generate CRUD API when category is created
CREATE OR REPLACE FUNCTION trigger_auto_generate_crud_api()
RETURNS TRIGGER AS $$
DECLARE
    v_base_path VARCHAR(500);
    v_table_name VARCHAR(255);
    v_route_id VARCHAR(255);
    v_endpoints JSONB;
BEGIN
    -- Only proceed if auto_generate_crud_api is true
    IF NEW.auto_generate_crud_api = TRUE THEN
        -- Generate base path and table name
        v_base_path := '/api/categories/' || NEW.name;
        v_table_name := NEW.name;
        v_route_id := 'route_' || NEW.category_id || '_' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');
        
        -- Define standard CRUD endpoints
        v_endpoints := jsonb_build_array(
            jsonb_build_object('method', 'POST', 'path', v_base_path, 'description', 'Create new ' || NEW.display_name),
            jsonb_build_object('method', 'GET', 'path', v_base_path, 'description', 'List all ' || NEW.display_name),
            jsonb_build_object('method', 'GET', 'path', v_base_path || '/:id', 'description', 'Get ' || NEW.display_name || ' by ID'),
            jsonb_build_object('method', 'PUT', 'path', v_base_path || '/:id', 'description', 'Update ' || NEW.display_name),
            jsonb_build_object('method', 'DELETE', 'path', v_base_path || '/:id', 'description', 'Delete ' || NEW.display_name)
        );
        
        -- Insert auto-generated route info
        INSERT INTO auto_generated_api_routes (
            route_id,
            category_id,
            base_path,
            table_name,
            crud_enabled,
            use_cases,
            endpoints,
            swagger_spec,
            status
        ) VALUES (
            v_route_id,
            NEW.category_id,
            v_base_path,
            v_table_name,
            (NEW.api_config->>'crud_enabled')::boolean,
            COALESCE(NEW.api_config->'use_cases', '[]'::jsonb),
            v_endpoints,
            jsonb_build_object(
                'tags', jsonb_build_array(NEW.display_name),
                'basePath', v_base_path,
                'schemas', NEW.schema_definition
            ),
            'active'
        );
        
        -- Log the API generation
        RAISE NOTICE 'Auto-generated CRUD API for category: % at path: %', NEW.name, v_base_path;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate CRUD API on category insert
DROP TRIGGER IF EXISTS trigger_category_crud_generation ON categories;
CREATE TRIGGER trigger_category_crud_generation
    AFTER INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_generate_crud_api();

-- Create trigger function to regenerate API on category update
CREATE OR REPLACE FUNCTION trigger_regenerate_crud_api()
RETURNS TRIGGER AS $$
BEGIN
    -- If auto_generate_crud_api changed or api_config changed
    IF NEW.auto_generate_crud_api != OLD.auto_generate_crud_api OR 
       NEW.api_config != OLD.api_config OR
       NEW.schema_definition != OLD.schema_definition THEN
        
        -- Mark existing routes as inactive
        UPDATE auto_generated_api_routes
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE category_id = NEW.category_id AND status = 'active';
        
        -- Trigger regeneration by calling the insert function
        PERFORM trigger_auto_generate_crud_api();
        
        RAISE NOTICE 'Regenerated CRUD API for category: %', NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to regenerate API on category update
DROP TRIGGER IF EXISTS trigger_category_crud_regeneration ON categories;
CREATE TRIGGER trigger_category_crud_regeneration
    AFTER UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_regenerate_crud_api();

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_items_updated_at 
    BEFORE UPDATE ON category_items
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_routes_updated_at 
    BEFORE UPDATE ON auto_generated_api_routes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_config_updated_at 
    BEFORE UPDATE ON category_system_config
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for active API routes
CREATE OR REPLACE VIEW v_active_api_routes AS
SELECT 
    ar.route_id,
    ar.category_id,
    c.name as category_name,
    c.display_name,
    ar.base_path,
    ar.table_name,
    ar.crud_enabled,
    ar.endpoints,
    ar.swagger_spec,
    ar.last_generated_at,
    c.auto_generate_crud_api
FROM auto_generated_api_routes ar
JOIN categories c ON ar.category_id = c.category_id
WHERE ar.status = 'active' AND c.status = 'active';

-- Create view for category statistics
CREATE OR REPLACE VIEW v_category_statistics AS
SELECT 
    c.category_id,
    c.name,
    c.display_name,
    c.category_type,
    c.status,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT ar.id) as total_api_routes,
    c.auto_generate_crud_api,
    c.created_at
FROM categories c
LEFT JOIN category_items ci ON c.category_id = ci.category_id
LEFT JOIN auto_generated_api_routes ar ON c.category_id = ar.category_id AND ar.status = 'active'
GROUP BY c.category_id, c.name, c.display_name, c.category_type, c.status, c.auto_generate_crud_api, c.created_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON category_items TO your_app_user;
-- GRANT SELECT ON auto_generated_api_routes TO your_app_user;
-- GRANT SELECT ON category_system_config TO your_app_user;
