-- ---------------------------------------------------------------------------
-- Neural network orchestration, schema discovery, and attribute automation
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'neural_instance_status') THEN
    CREATE TYPE neural_instance_status AS ENUM (
      'provisioning',
      'idle',
      'training',
      'validating',
      'ready',
      'failed',
      'archived'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS neural_network_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  workflow_instance_id UUID UNIQUE REFERENCES workflow_instances(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  model_type TEXT NOT NULL,
  current_version TEXT,
  status neural_instance_status NOT NULL DEFAULT 'provisioning',
  automation_enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  last_trained_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neural_instances_workflow
  ON neural_network_instances(workflow_id, status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'neural_run_status') THEN
    CREATE TYPE neural_run_status AS ENUM (
      'queued',
      'preparing-data',
      'training',
      'validating',
      'completed',
      'failed'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS neural_training_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_instance_id UUID NOT NULL REFERENCES neural_network_instances(id) ON DELETE CASCADE,
  training_job_id UUID REFERENCES training_jobs(id) ON DELETE SET NULL,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  status neural_run_status NOT NULL DEFAULT 'queued',
  dataset_overview JSONB DEFAULT '{}'::jsonb,
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_neural_training_runs_instance
  ON neural_training_runs(neural_instance_id, status, started_at DESC);

CREATE TABLE IF NOT EXISTS neural_training_schema_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_instance_id UUID NOT NULL REFERENCES neural_network_instances(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  schema_snapshot JSONB NOT NULL,
  attributes JSONB DEFAULT '[]'::jsonb,
  discovered_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (neural_instance_id, version)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schema_link_source') THEN
    CREATE TYPE schema_link_source AS ENUM ('attribute', 'component', 'dashboard', 'dataset');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS neural_schema_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source_type schema_link_source NOT NULL,
  source_id UUID,
  schema_uri TEXT NOT NULL,
  relation JSONB DEFAULT '{}'::jsonb,
  confidence NUMERIC(4,3) DEFAULT 0.800,
  metadata JSONB DEFAULT '{}'::jsonb,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workflow_id, source_type, source_id, schema_uri)
);

CREATE INDEX IF NOT EXISTS idx_neural_schema_links_workflow
  ON neural_schema_links(workflow_id, source_type);

CREATE TABLE IF NOT EXISTS neural_attribute_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  suggestion JSONB NOT NULL,
  confidence NUMERIC(4,3) DEFAULT 0.750,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  applied_attribute_id UUID REFERENCES workflow_attributes(id) ON DELETE SET NULL
);

ALTER TABLE workflow_attributes
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS discovered_from JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_by_neural BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION touch_neural_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_neural_instances_updated_at'
  ) THEN
    CREATE TRIGGER trg_neural_instances_updated_at
      BEFORE UPDATE ON neural_network_instances
      FOR EACH ROW
      EXECUTE FUNCTION touch_neural_instance_updated_at();
  END IF;
END$$;
