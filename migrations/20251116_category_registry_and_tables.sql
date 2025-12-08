-- Category registry, config infrastructure, and base instance tables
-- Generated on 2025-11-16 to backfill missing category metadata and storage tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS category_table_registry CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS category_relationships CASCADE;
DROP TABLE IF EXISTS instance_execution_history CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  default_table TEXT,
  config_table TEXT,
  log_table TEXT,
  auto_generate_crud BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  schema_definition JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_table_registry (
  registry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  table_type TEXT NOT NULL CHECK (table_type IN ('data', 'config', 'log')),
  table_name TEXT NOT NULL,
  ensure_schema JSONB DEFAULT '{}'::jsonb,
  is_managed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category_id, table_type)
);

CREATE TABLE IF NOT EXISTS category_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_category TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  child_category TEXT NOT NULL,
  child_id TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'belongs_to',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_category, parent_id, child_category, child_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS instance_execution_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_category TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  execution_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  input_params JSONB DEFAULT '{}'::jsonb,
  output_result JSONB DEFAULT '{}'::jsonb,
  error_details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_instance_execution_category
  ON instance_execution_history(instance_category, instance_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS apps (
  id SERIAL PRIMARY KEY,
  app_uid TEXT UNIQUE DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  config JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  auto_generate_crud BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seed_instances (
  id SERIAL PRIMARY KEY,
  seed_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  seed_type TEXT DEFAULT 'url',
  seed_value TEXT,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}'::jsonb,
  app_id INTEGER REFERENCES apps(id),
  campaign_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crawler_instances (
  id SERIAL PRIMARY KEY,
  crawler_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  crawler_type TEXT DEFAULT 'puppeteer',
  status TEXT DEFAULT 'idle',
  target_config JSONB DEFAULT '{}'::jsonb,
  extraction_rules JSONB DEFAULT '{}'::jsonb,
  concurrency INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  app_id INTEGER REFERENCES apps(id),
  campaign_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduler_instances (
  id SERIAL PRIMARY KEY,
  scheduler_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT DEFAULT 'cron',
  status TEXT DEFAULT 'inactive',
  schedule_expression TEXT,
  timezone TEXT DEFAULT 'UTC',
  payload JSONB DEFAULT '{}'::jsonb,
  target_entity_type TEXT,
  target_entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_stream_instances (
  id SERIAL PRIMARY KEY,
  stream_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'inactive',
  source_type TEXT,
  destination_type TEXT,
  source_config JSONB DEFAULT '{}'::jsonb,
  destination_config JSONB DEFAULT '{}'::jsonb,
  transformation_rules JSONB DEFAULT '[]'::jsonb,
  attribute_ids JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  workflow_instance_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attribute_instances (
  id SERIAL PRIMARY KEY,
  attribute_instance_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_type TEXT DEFAULT 'string',
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  display_config JSONB DEFAULT '{}'::jsonb,
  data_stream_ids JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  app_id INTEGER REFERENCES apps(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_registry (
  id SERIAL PRIMARY KEY,
  model_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model_type TEXT,
  provider TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_records (
  id SERIAL PRIMARY KEY,
  demo_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS app_id INTEGER REFERENCES apps(id);
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_type TEXT;
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
    BEGIN
      ALTER TABLE campaigns ALTER COLUMN progress TYPE JSONB
      USING CASE
        WHEN pg_typeof(progress) = 'jsonb'::regtype THEN progress
        ELSE to_jsonb(progress)
      END;
    EXCEPTION WHEN undefined_column OR datatype_mismatch THEN
      NULL;
    END;
  END IF;

  IF to_regclass('public.service_instances') IS NOT NULL THEN
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS instance_config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS api_functions JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS health_check_config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS app_id INTEGER;
    ALTER TABLE service_instances ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
  END IF;

  IF to_regclass('public.workflow_instances') IS NOT NULL THEN
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS workflow_type TEXT;
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS data_stream_ids JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
  END IF;

  IF to_regclass('public.data_mining_instances') IS NOT NULL THEN
    ALTER TABLE data_mining_instances ADD COLUMN IF NOT EXISTS target_type TEXT;
    ALTER TABLE data_mining_instances ADD COLUMN IF NOT EXISTS mining_strategy TEXT;
    ALTER TABLE data_mining_instances ADD COLUMN IF NOT EXISTS extraction_rules JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE data_mining_instances ADD COLUMN IF NOT EXISTS attribute_config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE data_mining_instances ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
  END IF;

  IF to_regclass('public.neural_network_instances') IS NOT NULL THEN
    ALTER TABLE neural_network_instances ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
  END IF;

  IF to_regclass('public.training_datasets') IS NOT NULL THEN
    ALTER TABLE training_datasets ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
  END IF;

  IF to_regclass('public.data_mining_jobs') IS NOT NULL THEN
    ALTER TABLE data_mining_jobs ADD COLUMN IF NOT EXISTS auto_generate_crud BOOLEAN DEFAULT TRUE;
  END IF;

  IF to_regclass('public.instance_execution_history') IS NOT NULL THEN
    ALTER TABLE instance_execution_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

INSERT INTO categories (slug, display_name, description, default_table, config_table, log_table, auto_generate_crud, metadata)
VALUES
  ('demo', 'Demo', 'Demo navigation grouping for UI previews', 'demo_records', 'demo_config', 'instance_execution_history', FALSE, '{"group":"frontend"}'::jsonb),
  ('campaign', 'Campaign', 'End-to-end automation campaigns', 'campaigns', 'campaign_config', 'instance_execution_history', TRUE, '{"group":"operations"}'::jsonb),
  ('service', 'Service', 'Service instances backing automation', 'service_instances', 'service_config', 'instance_execution_history', TRUE, '{"group":"operations"}'::jsonb),
  ('data-stream', 'Data Stream', 'Pipelines that move data through the platform', 'data_stream_instances', 'data_stream_config', 'instance_execution_history', TRUE, '{"group":"data"}'::jsonb),
  ('attribute', 'Attribute', 'Attributes discovered and managed by the system', 'attribute_instances', 'attribute_config', 'instance_execution_history', TRUE, '{"group":"data"}'::jsonb),
  ('model', 'Model', 'Model registry entries and configuration', 'model_registry', 'model_config', 'instance_execution_history', TRUE, '{"group":"ai"}'::jsonb),
  ('training-data', 'Training Data', 'Training datasets managed by the platform', 'training_datasets', 'training_data_config', 'instance_execution_history', TRUE, '{"group":"ai"}'::jsonb),
  ('neural-network', 'Neural Network', 'Neural network instances and lifecycle', 'neural_network_instances', 'neural_network_config', 'instance_execution_history', TRUE, '{"group":"ai"}'::jsonb),
  ('admin', 'Admin', 'Administrative and dashboard assets', 'admin_nav_templates', 'admin_config', 'instance_execution_history', FALSE, '{"group":"operations"}'::jsonb),
  ('crawler', 'Crawler', 'Crawler instances responsible for acquisition', 'crawler_instances', 'crawler_config', 'instance_execution_history', TRUE, '{"group":"data"}'::jsonb),
  ('seeder', 'Seeder', 'Seed lists and discovery orchestrators', 'seed_instances', 'seeder_config', 'instance_execution_history', TRUE, '{"group":"data"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  default_table = EXCLUDED.default_table,
  config_table = EXCLUDED.config_table,
  log_table = EXCLUDED.log_table,
  auto_generate_crud = EXCLUDED.auto_generate_crud,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

DO $$
DECLARE
  rec RECORD;
  trig_name TEXT;
BEGIN
  FOR rec IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'apps','seed_instances','crawler_instances','scheduler_instances','data_stream_instances','attribute_instances','model_registry','demo_records','campaigns','service_instances','workflow_instances','data_mining_instances','neural_network_instances','training_datasets','data_mining_jobs'
  ) LOOP
    trig_name := 'set_' || rec.tablename || '_updated_at';
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trig_name, rec.tablename);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', trig_name, rec.tablename);
  END LOOP;
END $$;
