-- Workflow orchestration & neural training schema

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_key TEXT NOT NULL,
  prompt TEXT NOT NULL,
  dataset_name TEXT NOT NULL,
  dataset_description TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  attr_key TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  description TEXT,
  weight NUMERIC(4,3),
  UNIQUE (workflow_id, attr_key)
);

ALTER TABLE workflow_attributes
  ADD COLUMN IF NOT EXISTS enrichment_prompt TEXT;

CREATE TABLE IF NOT EXISTS workflow_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  intent TEXT,
  cadence TEXT,
  schema_attributes JSONB DEFAULT '[]'::jsonb,
  weight NUMERIC(4,3) DEFAULT 1.0
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_run_status') THEN
    CREATE TYPE workflow_run_status AS ENUM ('queued', 'preparing-data', 'training', 'completed', 'failed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  status workflow_run_status NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artifact_type') THEN
    CREATE TYPE artifact_type AS ENUM ('dataset_snapshot', 'training_log', 'tfjs_model', 'tensorflow_model');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS training_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  type artifact_type NOT NULL,
  storage_uri TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Schema graph: atoms -> components -> dashboards -> workflows
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS atom_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  schema JSONB DEFAULT '{}'::jsonb,
  extraction_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, category)
);

CREATE TABLE IF NOT EXISTS component_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variant TEXT,
  description TEXT,
  schema JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, COALESCE(variant, 'default'))
);

CREATE TABLE IF NOT EXISTS component_atoms (
  component_id UUID NOT NULL REFERENCES component_definitions(id) ON DELETE CASCADE,
  atom_id UUID NOT NULL REFERENCES atom_definitions(id) ON DELETE CASCADE,
  role TEXT,
  binding JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (component_id, atom_id)
);

CREATE TABLE IF NOT EXISTS dashboard_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  layout JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_components (
  dashboard_id UUID NOT NULL REFERENCES dashboard_definitions(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES component_definitions(id) ON DELETE CASCADE,
  position JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (dashboard_id, component_id)
);

CREATE TABLE IF NOT EXISTS workflow_dashboards (
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  dashboard_id UUID NOT NULL REFERENCES dashboard_definitions(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (workflow_id, dashboard_id)
);

-- ---------------------------------------------------------------------------
-- Prompt-driven mining & training queueing
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS mining_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  schema_key TEXT,
  priority INTEGER DEFAULT 5,
  status job_status NOT NULL DEFAULT 'queued',
  payload JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mining_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES mining_queue(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  payload JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mining_job_id UUID REFERENCES mining_jobs(id) ON DELETE SET NULL,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  status job_status NOT NULL DEFAULT 'queued',
  dataset_uri TEXT,
  model_uri TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS job_event_log (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  status job_status NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mining_queue_status ON mining_queue (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_mining_jobs_queue ON mining_jobs (queue_id, status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs (status, created_at);
