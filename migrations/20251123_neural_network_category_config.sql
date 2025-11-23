-- Migration: Ensure Neural Network Category and Configuration
-- Description: Add neural network category with proper configuration and relationships
-- Created: 2025-11-23

-- Ensure categories table exists (from 20251114_create_category_system.sql)
-- This migration is idempotent and safe to run multiple times

-- Insert or update neural network category
INSERT INTO categories (
    category_id,
    name,
    display_name,
    description,
    category_type,
    auto_generate_crud_api,
    api_config,
    schema_definition,
    icon,
    color,
    sort_order
) VALUES (
    'neural-networks',
    'neural_networks',
    'Neural Networks',
    'AI/ML neural network model instances with training capabilities, dataset management, and integration with crawlers and SEO campaigns',
    'neural_network',
    true,
    '{
        "crud_enabled": true,
        "use_cases": ["train", "predict", "evaluate", "deploy", "upload_dataset"],
        "search_fields": ["name", "description", "model_type"],
        "filter_fields": ["status", "model_type", "client_id"],
        "api_enabled": true,
        "pagination": {
            "enabled": true,
            "default_limit": 50,
            "max_limit": 100
        },
        "authentication": {
            "required": true,
            "roles": ["admin", "ml_engineer"]
        },
        "relationships": {
            "crawler": "many_to_many",
            "seeder": "many_to_many",
            "attributes": "many_to_many",
            "data_streams": "many_to_many"
        }
    }'::jsonb,
    '{
        "fields": [
            {"name": "name", "type": "string", "required": true},
            {"name": "description", "type": "text", "required": false},
            {"name": "client_id", "type": "string", "required": true},
            {"name": "model_type", "type": "string", "required": true},
            {"name": "status", "type": "string", "default": "initializing"},
            {"name": "version", "type": "string", "default": "v1.0.0"},
            {"name": "training_config", "type": "jsonb", "default": {}},
            {"name": "data_config", "type": "jsonb", "default": {}},
            {"name": "architecture", "type": "jsonb"},
            {"name": "performance", "type": "jsonb"},
            {"name": "metadata", "type": "jsonb", "default": {}}
        ]
    }'::jsonb,
    '🧠',
    '#1890ff',
    50
) ON CONFLICT (category_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    api_config = EXCLUDED.api_config,
    schema_definition = EXCLUDED.schema_definition,
    icon = EXCLUDED.icon,
    updated_at = NOW();

-- Insert or update data streams category
INSERT INTO categories (
    category_id,
    name,
    display_name,
    description,
    category_type,
    auto_generate_crud_api,
    api_config,
    schema_definition,
    icon,
    color,
    sort_order
) VALUES (
    'data-streams',
    'data_streams',
    'Data Streams',
    'Data flow configuration between services with transformation rules and attribute bundling',
    'data_stream',
    true,
    '{
        "crud_enabled": true,
        "use_cases": ["start", "stop", "pause", "metrics"],
        "search_fields": ["name", "description", "source_type", "destination_type"],
        "filter_fields": ["status", "source_type", "destination_type"],
        "api_enabled": true,
        "pagination": {
            "enabled": true,
            "default_limit": 50,
            "max_limit": 100
        }
    }'::jsonb,
    '{
        "fields": [
            {"name": "name", "type": "string", "required": true},
            {"name": "description", "type": "text"},
            {"name": "source_type", "type": "string", "required": true},
            {"name": "source_config", "type": "jsonb", "default": {}},
            {"name": "destination_type", "type": "string", "required": true},
            {"name": "destination_config", "type": "jsonb", "default": {}},
            {"name": "transformation_rules", "type": "jsonb", "default": []},
            {"name": "attribute_ids", "type": "array"},
            {"name": "status", "type": "string", "default": "inactive"}
        ]
    }'::jsonb,
    '🌊',
    '#13c2c2',
    60
) ON CONFLICT (category_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    api_config = EXCLUDED.api_config,
    schema_definition = EXCLUDED.schema_definition,
    updated_at = NOW();

-- Insert default category configuration for neural networks
INSERT INTO category_system_config (config_key, config_value, description, is_system) VALUES
('neural_network_defaults', '{
    "default_models": ["scraping", "data_mining"],
    "training_defaults": {
        "epochs": 50,
        "batch_size": 32,
        "learning_rate": 0.001,
        "validation_split": 0.2
    },
    "model_types": [
        {"value": "seo_optimization", "label": "SEO Optimization", "default_models": ["scraping", "data_mining"]},
        {"value": "crawler_optimization", "label": "Crawler Optimization", "default_models": ["scraping", "pattern_recognition"]},
        {"value": "content_generation", "label": "Content Generation", "default_models": ["text_generation", "nlp"]},
        {"value": "data_mining", "label": "Data Mining", "default_models": ["data_mining", "clustering"]},
        {"value": "pattern_recognition", "label": "Pattern Recognition", "default_models": ["classification", "pattern_recognition"]},
        {"value": "sentiment_analysis", "label": "Sentiment Analysis", "default_models": ["nlp", "sentiment"]}
    ],
    "integrations": {
        "crawlee": true,
        "tensorflow": true,
        "seo_campaigns": true
    }
}'::jsonb, 'Default configuration for neural network instances', true),
('data_stream_config', '{
    "default_throughput_limit": 1000,
    "transformation_types": ["map", "filter", "reduce", "aggregate", "enrich"],
    "source_types": ["api", "database", "file", "stream", "webhook"],
    "destination_types": ["api", "database", "file", "stream", "neural_network"]
}'::jsonb, 'Configuration for data stream management', true)
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Create view for neural network with relationships
CREATE OR REPLACE VIEW v_neural_network_with_relationships AS
SELECT 
    nn.*,
    COALESCE(json_agg(DISTINCT cr_crawler.*) FILTER (WHERE cr_crawler.child_id IS NOT NULL), '[]'::json) as crawlers,
    COALESCE(json_agg(DISTINCT cr_seeder.*) FILTER (WHERE cr_seeder.child_id IS NOT NULL), '[]'::json) as seeders,
    COALESCE(json_agg(DISTINCT cr_attr.*) FILTER (WHERE cr_attr.child_id IS NOT NULL), '[]'::json) as attributes,
    COALESCE(json_agg(DISTINCT cr_stream.*) FILTER (WHERE cr_stream.child_id IS NOT NULL), '[]'::json) as data_streams
FROM neural_network_instances nn
LEFT JOIN category_relationships cr_crawler 
    ON cr_crawler.parent_id = nn.id AND cr_crawler.child_category = 'crawler'
LEFT JOIN category_relationships cr_seeder 
    ON cr_seeder.parent_id = nn.id AND cr_seeder.child_category = 'seeder'
LEFT JOIN category_relationships cr_attr 
    ON cr_attr.parent_id = nn.id AND cr_attr.child_category = 'attribute'
LEFT JOIN category_relationships cr_stream 
    ON cr_stream.parent_id = nn.id AND cr_stream.child_category = 'data_stream'
GROUP BY nn.id;

-- Create function to link neural network with crawler
CREATE OR REPLACE FUNCTION link_neural_network_to_crawler(
    p_neural_network_id UUID,
    p_crawler_id UUID
) RETURNS void AS $$
BEGIN
    INSERT INTO category_relationships (
        parent_category, parent_id,
        child_category, child_id,
        relationship_type,
        metadata
    ) VALUES (
        'neural_network', p_neural_network_id,
        'crawler', p_crawler_id,
        'enhances',
        jsonb_build_object(
            'purpose', 'ML-enhanced crawling',
            'created_at', NOW()
        )
    ) ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create function to link neural network with seeder
CREATE OR REPLACE FUNCTION link_neural_network_to_seeder(
    p_neural_network_id UUID,
    p_seeder_id UUID
) RETURNS void AS $$
BEGIN
    INSERT INTO category_relationships (
        parent_category, parent_id,
        child_category, child_id,
        relationship_type,
        metadata
    ) VALUES (
        'neural_network', p_neural_network_id,
        'seeder', p_seeder_id,
        'translates',
        jsonb_build_object(
            'purpose', 'Topic translation for seeding',
            'created_at', NOW()
        )
    ) ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create function to link neural network with attributes
CREATE OR REPLACE FUNCTION link_neural_network_to_attributes(
    p_neural_network_id UUID,
    p_attribute_ids UUID[]
) RETURNS void AS $$
DECLARE
    attr_id UUID;
BEGIN
    FOREACH attr_id IN ARRAY p_attribute_ids
    LOOP
        INSERT INTO category_relationships (
            parent_category, parent_id,
            child_category, child_id,
            relationship_type,
            metadata
        ) VALUES (
            'neural_network', p_neural_network_id,
            'attribute', attr_id,
            'uses',
            jsonb_build_object(
                'purpose', 'Attribute-based learning',
                'created_at', NOW()
            )
        ) ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION link_neural_network_to_crawler IS 'Links a neural network instance to a crawler for ML-enhanced crawling';
COMMENT ON FUNCTION link_neural_network_to_seeder IS 'Links a neural network instance to a seeder for topic translation';
COMMENT ON FUNCTION link_neural_network_to_attributes IS 'Links a neural network instance to multiple attributes for training';

-- Grant permissions
GRANT SELECT ON v_neural_network_with_relationships TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_crawler TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_seeder TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_attributes TO PUBLIC;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Neural network category configuration completed successfully';
END $$;
