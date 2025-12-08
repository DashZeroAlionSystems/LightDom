-- Migration 215: SEO Attribute Category Config Views
-- Purpose: Provide per-category configuration views combining seo_attributes_config and attribute_configurations

CREATE OR REPLACE FUNCTION refresh_seo_attribute_category_views()
RETURNS void AS $$
DECLARE
  category_record RECORD;
BEGIN
  FOR category_record IN SELECT DISTINCT category FROM seo_attributes_config LOOP
    EXECUTE format('DROP VIEW IF EXISTS %I_config;', category_record.category);
    EXECUTE format(
      'CREATE VIEW %I_config AS
         SELECT
           sac.id,
           sac.attribute_name,
           sac.category,
           sac.description,
           sac.data_type,
           sac.extraction_algorithm,
           sac.deepseek_prompt,
           sac.component_schema,
           sac.is_active,
           sac.priority,
           sac.created_at,
           sac.updated_at,
           ac.config AS attribute_config,
           ac.version AS attribute_config_version,
           ac.active AS attribute_config_active,
           ac.updated_at AS attribute_config_updated_at
         FROM seo_attributes_config sac
         LEFT JOIN attribute_configurations ac
           ON ac.attribute_name = sac.attribute_name
         WHERE sac.category = %L;',
      category_record.category,
      category_record.category
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_seo_attribute_category_views() IS 'Creates or refreshes {category}_config views for SEO attributes';

SELECT refresh_seo_attribute_category_views();
