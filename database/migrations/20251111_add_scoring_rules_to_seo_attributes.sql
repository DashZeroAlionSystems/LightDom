-- Migration: Add scoring_rules and default_value to seo_attributes_config
-- Date: 2025-11-11

BEGIN;

ALTER TABLE seo_attributes_config
  ADD COLUMN IF NOT EXISTS scoring_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS default_value JSONB DEFAULT NULL;

-- Set scoring rules and weights for key performance attributes
UPDATE seo_attributes_config SET scoring_rules = 
  '{"thresholds": {"excellent":2500,"good":4000,"needs_improvement":99999}, "weight": 0.12, "better":"lower"}'::jsonb
WHERE attribute_name = 'largest_contentful_paint';

UPDATE seo_attributes_config SET scoring_rules = 
  '{"thresholds": {"excellent":100,"good":300,"needs_improvement":99999}, "weight": 0.12, "better":"lower"}'::jsonb
WHERE attribute_name = 'first_input_delay';

UPDATE seo_attributes_config SET scoring_rules = 
  '{"thresholds": {"excellent":0.1,"good":0.25,"needs_improvement":1}, "weight": 0.12, "better":"lower"}'::jsonb
WHERE attribute_name = 'cumulative_layout_shift';

UPDATE seo_attributes_config SET scoring_rules =
  '{"thresholds": {"excellent":200,"good":500,"needs_improvement":99999}, "weight": 0.06, "better":"lower"}'::jsonb
WHERE attribute_name IN ('first_contentful_paint','time_to_first_byte','page_load_time');

-- HTTPS as a boolean good-signal
UPDATE seo_attributes_config SET default_value = 'true'::jsonb, scoring_rules = '{"weight":0.08, "better":"higher"}'::jsonb WHERE attribute_name = 'https_enabled';

-- Schema presence is valuable
UPDATE seo_attributes_config SET scoring_rules = '{"weight":0.10, "better":"higher"}'::jsonb WHERE attribute_name = 'schema_markup_present';

COMMIT;
