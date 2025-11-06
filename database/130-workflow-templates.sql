-- ---------------------------------------------------------------------------
-- Schema extensions for workflow templates, semantic component linking,
-- and TensorFlow instance orchestration.
-- ---------------------------------------------------------------------------

-- Required extensions -------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Workflow templates
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  primary_prompt TEXT,
  schema_context JSONB DEFAULT '{}'::jsonb,
  default_tasks JSONB DEFAULT '[]'::jsonb,
  default_atoms JSONB DEFAULT '[]'::jsonb,
  default_components JSONB DEFAULT '[]'::jsonb,
  default_dashboards JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  task_label TEXT NOT NULL,
  schema_refs JSONB DEFAULT '[]'::jsonb,
  handler_type TEXT NOT NULL,
  handler_config JSONB DEFAULT '{}'::jsonb,
  is_optional BOOLEAN DEFAULT FALSE,
  ordering INTEGER DEFAULT 0,
  ui_wizard_step INTEGER,
  UNIQUE (template_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_workflow_template_tasks_template_id
  ON workflow_template_tasks(template_id);

-- ---------------------------------------------------------------------------
-- Workflow campaign instances
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  prompt_payload JSONB DEFAULT '{}'::jsonb,
  active_tasks JSONB DEFAULT '[]'::jsonb,
  linked_schema_nodes JSONB DEFAULT '{}'::jsonb,
  tf_model_id UUID,
  automation_threshold INTEGER,
  automation_state JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_template_id
  ON workflow_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow_id
  ON workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status
  ON workflow_instances(status);

-- Automatically bump updated_at on mutation
CREATE OR REPLACE FUNCTION set_workflow_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_workflow_instances_updated_at'
  ) THEN
    CREATE TRIGGER trg_workflow_instances_updated_at
      BEFORE UPDATE ON workflow_instances
      FOR EACH ROW
      EXECUTE FUNCTION set_workflow_instance_updated_at();
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Schema.org component linking
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS component_schema_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES component_definitions(id) ON DELETE CASCADE,
  atom_id UUID REFERENCES atom_definitions(id) ON DELETE CASCADE,
  schema_uri TEXT NOT NULL,
  role TEXT,
  style_token_refs JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_component_schema_links_component
  ON component_schema_links(component_id);
CREATE INDEX IF NOT EXISTS idx_component_schema_links_atom
  ON component_schema_links(atom_id);
CREATE INDEX IF NOT EXISTS idx_component_schema_links_schema_uri
  ON component_schema_links(schema_uri);

-- ---------------------------------------------------------------------------
-- TensorFlow base models and campaign instances
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tf_base_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  architecture TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  feature_schema JSONB DEFAULT '{}'::jsonb,
  last_validated_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model_name, version)
);

CREATE TABLE IF NOT EXISTS tf_model_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  base_model_id UUID REFERENCES tf_base_models(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  training_args JSONB DEFAULT '{}'::jsonb,
  checkpoint_uri TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tf_model_instances_workflow_instance
  ON tf_model_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_tf_model_instances_base_model
  ON tf_model_instances(base_model_id);
CREATE INDEX IF NOT EXISTS idx_tf_model_instances_status
  ON tf_model_instances(status);

-- ---------------------------------------------------------------------------
-- Workflow JSONP cache for prompt-driven configuration exports
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_jsonp_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  payload JSONB NOT NULL,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_workflow_jsonp_cache_template_slug
  ON workflow_jsonp_cache(template_id, slug);

