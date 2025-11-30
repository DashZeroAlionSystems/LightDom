-- Migration: Ensure Neural Network Category and Configuration
-- Description: Upsert neural network and data stream categories with consistent configuration metadata
-- Created: 2025-11-23

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure relationship table can store metadata for richer linkage context
ALTER TABLE category_relationships
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Upsert neural network category using slug as deterministic identifier
INSERT INTO categories (
    category_id,
    slug,
    display_name,
    description,
    default_table,
    config_table,
    log_table,
    auto_generate_crud,
    is_active,
    schema_definition,
    metadata
)
SELECT
    uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'neural-networks'),
    'neural-networks',
    'Neural Networks',
    'AI/ML neural network model instances with training capabilities, dataset management, and integration with crawlers and SEO campaigns',
    'neural_network_instances',
    'neural_network_configs',
    'neural_network_logs',
    TRUE,
    TRUE,
    jsonb_build_array(
        jsonb_build_object('name', 'name', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'description', 'type', 'text'),
        jsonb_build_object('name', 'client_id', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'model_type', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'status', 'type', 'string', 'default', 'initializing'),
        jsonb_build_object('name', 'version', 'type', 'string', 'default', 'v1.0.0'),
        jsonb_build_object('name', 'training_config', 'type', 'jsonb', 'default', jsonb_build_object()),
        jsonb_build_object('name', 'data_config', 'type', 'jsonb', 'default', jsonb_build_object()),
        jsonb_build_object('name', 'architecture', 'type', 'jsonb'),
        jsonb_build_object('name', 'performance', 'type', 'jsonb'),
        jsonb_build_object('name', 'metadata', 'type', 'jsonb', 'default', jsonb_build_object())
    ),
    jsonb_build_object(
        'category_type', 'neural_network',
        'icon', '🧠',
        'color', '#1890ff',
        'sort_order', 50,
        'api_config', jsonb_build_object(
            'crud_enabled', TRUE,
            'use_cases', jsonb_build_array('train', 'predict', 'evaluate', 'deploy', 'upload_dataset'),
            'search_fields', jsonb_build_array('name', 'description', 'model_type'),
            'filter_fields', jsonb_build_array('status', 'model_type', 'client_id'),
            'api_enabled', TRUE,
            'pagination', jsonb_build_object('enabled', TRUE, 'default_limit', 50, 'max_limit', 100),
            'authentication', jsonb_build_object('required', TRUE, 'roles', jsonb_build_array('admin', 'ml_engineer')),
            'relationships', jsonb_build_object(
                'crawler', 'many_to_many',
                'seeder', 'many_to_many',
                'attributes', 'many_to_many',
                'data_streams', 'many_to_many'
            )
        )
    )
ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    default_table = EXCLUDED.default_table,
    config_table = EXCLUDED.config_table,
    log_table = EXCLUDED.log_table,
    auto_generate_crud = EXCLUDED.auto_generate_crud,
    is_active = EXCLUDED.is_active,
    schema_definition = EXCLUDED.schema_definition,
    metadata = COALESCE(categories.metadata, '{}'::jsonb) || EXCLUDED.metadata,
    updated_at = NOW();

-- Upsert data stream category definition
INSERT INTO categories (
    category_id,
    slug,
    display_name,
    description,
    default_table,
    config_table,
    log_table,
    auto_generate_crud,
    is_active,
    schema_definition,
    metadata
)
SELECT
    uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'data-streams'),
    'data-streams',
    'Data Streams',
    'Data flow configuration between services with transformation rules and attribute bundling',
    'data_stream_instances',
    'data_stream_configs',
    'data_stream_logs',
    TRUE,
    TRUE,
    jsonb_build_array(
        jsonb_build_object('name', 'name', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'description', 'type', 'text'),
        jsonb_build_object('name', 'source_type', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'source_config', 'type', 'jsonb', 'default', jsonb_build_object()),
        jsonb_build_object('name', 'destination_type', 'type', 'string', 'required', TRUE),
        jsonb_build_object('name', 'destination_config', 'type', 'jsonb', 'default', jsonb_build_object()),
        jsonb_build_object('name', 'transformation_rules', 'type', 'jsonb', 'default', jsonb_build_array()),
        jsonb_build_object('name', 'attribute_ids', 'type', 'jsonb', 'default', jsonb_build_array()),
        jsonb_build_object('name', 'status', 'type', 'string', 'default', 'inactive')
    ),
    jsonb_build_object(
        'category_type', 'data_stream',
        'icon', '🌊',
        'color', '#13c2c2',
        'sort_order', 60,
        'api_config', jsonb_build_object(
            'crud_enabled', TRUE,
            'use_cases', jsonb_build_array('start', 'stop', 'pause', 'metrics'),
            'search_fields', jsonb_build_array('name', 'description', 'source_type', 'destination_type'),
            'filter_fields', jsonb_build_array('status', 'source_type', 'destination_type'),
            'api_enabled', TRUE,
            'pagination', jsonb_build_object('enabled', TRUE, 'default_limit', 50, 'max_limit', 100)
        )
    )
ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    default_table = EXCLUDED.default_table,
    config_table = EXCLUDED.config_table,
    log_table = EXCLUDED.log_table,
    auto_generate_crud = EXCLUDED.auto_generate_crud,
    is_active = EXCLUDED.is_active,
    schema_definition = EXCLUDED.schema_definition,
    metadata = COALESCE(categories.metadata, '{}'::jsonb) || EXCLUDED.metadata,
    updated_at = NOW();

-- Insert default category configuration for neural networks and data streams
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
}'::jsonb, 'Default configuration for neural network instances', TRUE),
('data_stream_config', '{
    "default_throughput_limit": 1000,
    "transformation_types": ["map", "filter", "reduce", "aggregate", "enrich"],
    "source_types": ["api", "database", "file", "stream", "webhook"],
    "destination_types": ["api", "database", "file", "stream", "neural_network"]
}'::jsonb, 'Configuration for data stream management', TRUE)
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- View aggregating neural networks and related entities
CREATE OR REPLACE VIEW v_neural_network_with_relationships AS
SELECT 
    nn.*,
    COALESCE(json_agg(DISTINCT cr_crawler.*) FILTER (WHERE cr_crawler.child_id IS NOT NULL), '[]'::json) AS crawlers,
    COALESCE(json_agg(DISTINCT cr_seeder.*) FILTER (WHERE cr_seeder.child_id IS NOT NULL), '[]'::json) AS seeders,
    COALESCE(json_agg(DISTINCT cr_attr.*) FILTER (WHERE cr_attr.child_id IS NOT NULL), '[]'::json) AS attributes,
    COALESCE(json_agg(DISTINCT cr_stream.*) FILTER (WHERE cr_stream.child_id IS NOT NULL), '[]'::json) AS data_streams
FROM neural_network_instances nn
LEFT JOIN category_relationships cr_crawler 
    ON cr_crawler.parent_category = 'neural_network'
   AND cr_crawler.parent_id = COALESCE(nn.instance_id, nn.id::text)
   AND cr_crawler.child_category = 'crawler'
LEFT JOIN category_relationships cr_seeder 
    ON cr_seeder.parent_category = 'neural_network'
   AND cr_seeder.parent_id = COALESCE(nn.instance_id, nn.id::text)
   AND cr_seeder.child_category = 'seeder'
LEFT JOIN category_relationships cr_attr 
    ON cr_attr.parent_category = 'neural_network'
   AND cr_attr.parent_id = COALESCE(nn.instance_id, nn.id::text)
   AND cr_attr.child_category = 'attribute'
LEFT JOIN category_relationships cr_stream 
    ON cr_stream.parent_category = 'neural_network'
   AND cr_stream.parent_id = COALESCE(nn.instance_id, nn.id::text)
   AND cr_stream.child_category = 'data_stream'
GROUP BY nn.id;

-- Helper functions to link neural networks with other entities
CREATE OR REPLACE FUNCTION link_neural_network_to_crawler(
    p_neural_network_identifier TEXT,
    p_crawler_id TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_neural_network_identifier IS NULL OR p_crawler_id IS NULL THEN
        RAISE EXCEPTION 'Neural network identifier and crawler id are required';
    END IF;

    INSERT INTO category_relationships (
        parent_category, parent_id,
        child_category, child_id,
        relationship_type,
        metadata
    ) VALUES (
        'neural_network', p_neural_network_identifier,
        'crawler', p_crawler_id,
        'enhances',
        jsonb_build_object(
            'purpose', 'ML-enhanced crawling',
            'linked_at', NOW()
        )
    )
    ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type)
    DO UPDATE SET metadata = COALESCE(category_relationships.metadata, '{}'::jsonb) || EXCLUDED.metadata;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION link_neural_network_to_seeder(
    p_neural_network_identifier TEXT,
    p_seeder_id TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_neural_network_identifier IS NULL OR p_seeder_id IS NULL THEN
        RAISE EXCEPTION 'Neural network identifier and seeder id are required';
    END IF;

    INSERT INTO category_relationships (
        parent_category, parent_id,
        child_category, child_id,
        relationship_type,
        metadata
    ) VALUES (
        'neural_network', p_neural_network_identifier,
        'seeder', p_seeder_id,
        'translates',
        jsonb_build_object(
            'purpose', 'Topic translation for seeding',
            'linked_at', NOW()
        )
    )
    ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type)
    DO UPDATE SET metadata = COALESCE(category_relationships.metadata, '{}'::jsonb) || EXCLUDED.metadata;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION link_neural_network_to_attributes(
    p_neural_network_identifier TEXT,
    p_attribute_ids TEXT[]
) RETURNS VOID AS $$
DECLARE
    attr_id TEXT;
BEGIN
    IF p_neural_network_identifier IS NULL THEN
        RAISE EXCEPTION 'Neural network identifier is required';
    END IF;

    IF p_attribute_ids IS NULL OR array_length(p_attribute_ids, 1) IS NULL THEN
        RETURN;
    END IF;

    FOREACH attr_id IN ARRAY p_attribute_ids
    LOOP
        INSERT INTO category_relationships (
            parent_category, parent_id,
            child_category, child_id,
            relationship_type,
            metadata
        ) VALUES (
            'neural_network', p_neural_network_identifier,
            'attribute', attr_id,
            'uses',
            jsonb_build_object(
                'purpose', 'Attribute-based learning',
                'linked_at', NOW()
            )
        )
        ON CONFLICT (parent_category, parent_id, child_category, child_id, relationship_type)
        DO UPDATE SET metadata = COALESCE(category_relationships.metadata, '{}'::jsonb) || EXCLUDED.metadata;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Permissions
GRANT SELECT ON v_neural_network_with_relationships TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_crawler TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_seeder TO PUBLIC;
GRANT EXECUTE ON FUNCTION link_neural_network_to_attributes TO PUBLIC;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Neural network category configuration migration completed successfully';
END $$;
