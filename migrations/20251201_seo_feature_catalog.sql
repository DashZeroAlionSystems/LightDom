-- Migration: Enrich SEO training and crawler tables with feature catalog metadata
-- Date: 2025-12-01

BEGIN;

-- Extend crawled_sites with feature catalog outputs
ALTER TABLE IF EXISTS crawled_sites
  ADD COLUMN IF NOT EXISTS seo_stat_metrics JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_feature_vector DOUBLE PRECISION[] DEFAULT '{}'::double precision[],
  ADD COLUMN IF NOT EXISTS seo_feature_names TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS seo_feature_version TEXT,
  ADD COLUMN IF NOT EXISTS seo_quality_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS schema_types TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS rich_snippet_targets TEXT[] DEFAULT '{}'::text[];

-- Extend seo_training_data with aligned feature columns and schema annotations
ALTER TABLE IF EXISTS seo_training_data
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS page_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS performance_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS technical_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS content_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS headings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS paragraph_count INTEGER,
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dom_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS crawled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS feature_vector DOUBLE PRECISION[] DEFAULT '{}'::double precision[],
  ADD COLUMN IF NOT EXISTS feature_names TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS feature_version TEXT,
  ADD COLUMN IF NOT EXISTS schema_types TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS rich_snippet_targets TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66),
  ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(18,8);

-- Add new schema recommendation metadata fields
ALTER TABLE IF EXISTS seo_ml_recommendations
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS model_type TEXT,
  ADD COLUMN IF NOT EXISTS model_version TEXT,
  ADD COLUMN IF NOT EXISTS recommendation JSONB;

COMMIT;
