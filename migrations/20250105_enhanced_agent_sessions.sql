-- Enhanced Agent Session System Migration
-- Creates all necessary tables for knowledge graph-aware agent orchestration

-- ============================================================================
-- KNOWLEDGE GRAPH SECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_graph_sections (
  section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  relationships JSONB NOT NULL DEFAULT '[]',
  entry_points JSONB NOT NULL DEFAULT '[]',
  coverage_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_kg_sections_name ON knowledge_graph_sections(name);
CREATE INDEX idx_kg_sections_coverage ON knowledge_graph_sections(coverage_score);

-- ============================================================================
-- AGENT KNOWLEDGE CONTEXTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_knowledge_contexts (
  context_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  section_ids JSONB NOT NULL DEFAULT '[]',
  included_patterns JSONB DEFAULT '[]',
  excluded_patterns JSONB DEFAULT '[]',
  focus_areas JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_instance_id)
);

CREATE INDEX idx_agent_knowledge_instance ON agent_knowledge_contexts(agent_instance_id);

-- ============================================================================
-- AGENT NAVIGATION RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_navigation_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition JSONB NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('include', 'exclude', 'prioritize', 'deprioritize')),
  target_agent_types JSONB,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_nav_rules_active ON agent_navigation_rules(is_active);
CREATE INDEX idx_nav_rules_action ON agent_navigation_rules(action);

-- ============================================================================
-- AGENT DECISION CONTEXTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_decision_contexts (
  decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  available_agents JSONB NOT NULL,
  selected_agents JSONB NOT NULL,
  excluded_agents JSONB DEFAULT '[]',
  reasoning TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_decision_session ON agent_decision_contexts(session_id);
CREATE INDEX idx_decision_created ON agent_decision_contexts(created_at DESC);

-- ============================================================================
-- AGENT SPECIALIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_specializations (
  specialization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  required_capabilities JSONB DEFAULT '[]',
  knowledge_focus JSONB DEFAULT '[]',
  prompt_templates JSONB DEFAULT '[]',
  fine_tune_config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specializations_name ON agent_specializations(name);

-- ============================================================================
-- REPOSITORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS repositories (
  repo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_name VARCHAR(255) NOT NULL,
  repo_url TEXT,
  local_path TEXT,
  branch VARCHAR(100) DEFAULT 'main',
  last_synced_at TIMESTAMP,
  codebase_analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_repos_name ON repositories(repo_name);

-- ============================================================================
-- AGENT REPOSITORY ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_repository_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  repo_id UUID NOT NULL REFERENCES repositories(repo_id) ON DELETE CASCADE,
  access_level VARCHAR(20) DEFAULT 'read_write' CHECK (access_level IN ('read', 'read_write', 'admin')),
  scope_restrictions JSONB,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_instance_id, repo_id)
);

CREATE INDEX idx_repo_assignments_agent ON agent_repository_assignments(agent_instance_id);
CREATE INDEX idx_repo_assignments_repo ON agent_repository_assignments(repo_id);

-- ============================================================================
-- GENERATED PROMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_prompts (
  prompt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestrator_instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  target_agent_instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  prompt_content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  knowledge_graph_refs JSONB DEFAULT '[]',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_status VARCHAR(20) DEFAULT 'pending' CHECK (execution_status IN ('pending', 'in_progress', 'completed', 'failed')),
  result_summary TEXT,
  metadata JSONB
);

CREATE INDEX idx_gen_prompts_orchestrator ON generated_prompts(orchestrator_instance_id);
CREATE INDEX idx_gen_prompts_target ON generated_prompts(target_agent_instance_id);
CREATE INDEX idx_gen_prompts_status ON generated_prompts(execution_status);
CREATE INDEX idx_gen_prompts_created ON generated_prompts(generated_at DESC);

-- ============================================================================
-- AGENT FINE-TUNE JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_fine_tune_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  training_data_source TEXT,
  knowledge_graph_section_id UUID REFERENCES knowledge_graph_sections(section_id),
  training_config JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'training', 'validating', 'completed', 'failed')),
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  metrics JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fine_tune_agent ON agent_fine_tune_jobs(agent_instance_id);
CREATE INDEX idx_fine_tune_status ON agent_fine_tune_jobs(status);

-- ============================================================================
-- DOM LAYER VISUALIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS dom_layer_visualizations (
  visualization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
  layer_type VARCHAR(50) NOT NULL,
  render_data JSONB NOT NULL,
  screenshot_url TEXT,
  interactive_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_visualizations_agent ON dom_layer_visualizations(agent_instance_id);
CREATE INDEX idx_visualizations_type ON dom_layer_visualizations(layer_type);

-- ============================================================================
-- VISUAL COMPONENT PREVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS visual_component_previews (
  preview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_path TEXT NOT NULL,
  render_url TEXT NOT NULL,
  thumbnail_url TEXT,
  generated_by_agent_id UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_component_previews_agent ON visual_component_previews(generated_by_agent_id);
CREATE INDEX idx_component_previews_path ON visual_component_previews(component_path);

-- ============================================================================
-- DELEGATION RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS delegation_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  trigger_condition JSONB NOT NULL,
  target_agent_specialization VARCHAR(255),
  agent_selection_strategy VARCHAR(50) DEFAULT 'best_match' 
    CHECK (agent_selection_strategy IN ('best_match', 'round_robin', 'least_busy', 'specialized')),
  priority INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delegation_rules_active ON delegation_rules(is_active);
CREATE INDEX idx_delegation_rules_priority ON delegation_rules(priority DESC);

-- ============================================================================
-- DEEPSEEK ORCHESTRATION CONFIGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS deepseek_orchestration_configs (
  orchestrator_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  auto_delegation BOOLEAN DEFAULT true,
  prompt_generation_config JSONB DEFAULT '{}',
  agent_pool JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id)
);

CREATE INDEX idx_orchestration_session ON deepseek_orchestration_configs(session_id);

-- ============================================================================
-- SEED DEFAULT SPECIALIZATIONS
-- ============================================================================

INSERT INTO agent_specializations (name, description, required_capabilities, knowledge_focus, prompt_templates)
VALUES
  ('Frontend Developer', 'Specializes in React, TypeScript, and UI components', 
   '["code_generation", "component_design", "testing"]'::jsonb,
   '["src/components", "src/pages", "src/hooks"]'::jsonb,
   '[{"template_id": "frontend-1", "name": "Component Creation", "category": "frontend", "template": "Create a React component for {description}", "variables": ["description"]}]'::jsonb),
  
  ('Backend API Specialist', 'Focuses on Express routes, database queries, and API design',
   '["api_development", "database_design", "security"]'::jsonb,
   '["src/api", "src/services", "src/middleware"]'::jsonb,
   '[{"template_id": "backend-1", "name": "API Endpoint", "category": "backend", "template": "Create an API endpoint for {resource}", "variables": ["resource"]}]'::jsonb),
  
  ('Database Engineer', 'Expert in PostgreSQL schemas, migrations, and optimization',
   '["database_design", "query_optimization", "migration"]'::jsonb,
   '["migrations", "src/services"]'::jsonb,
   '[{"template_id": "db-1", "name": "Migration", "category": "database", "template": "Create migration for {change}", "variables": ["change"]}]'::jsonb),
  
  ('Code Reviewer', 'Analyzes code quality, security, and best practices',
   '["code_review", "security_audit", "refactoring"]'::jsonb,
   '[]'::jsonb,
   '[{"template_id": "review-1", "name": "Code Review", "category": "review", "template": "Review code in {file_path}", "variables": ["file_path"]}]'::jsonb),
  
  ('Documentation Writer', 'Creates comprehensive documentation and guides',
   '["documentation", "technical_writing"]'::jsonb,
   '["docs", "README.md"]'::jsonb,
   '[{"template_id": "docs-1", "name": "Documentation", "category": "docs", "template": "Document {feature}", "variables": ["feature"]}]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DEFAULT KNOWLEDGE SECTIONS
-- ============================================================================

INSERT INTO knowledge_graph_sections (name, description, nodes, entry_points, coverage_score)
VALUES
  ('Frontend Components', 'All React components and UI elements',
   '[{"node_id": "comp-1", "node_type": "component", "path": "src/components", "name": "Components", "relationships": []}]'::jsonb,
   '["src/App.tsx", "src/main.tsx"]'::jsonb,
   0.6),
  
  ('API Routes', 'Express API routes and middleware',
   '[{"node_id": "api-1", "node_type": "api", "path": "src/api/routes", "name": "API Routes", "relationships": []}]'::jsonb,
   '["api-server-express.js"]'::jsonb,
   0.7),
  
  ('Services Layer', 'Business logic and service classes',
   '[{"node_id": "svc-1", "node_type": "service", "path": "src/services", "name": "Services", "relationships": []}]'::jsonb,
   '["src/services"]'::jsonb,
   0.8),
  
  ('Database Schemas', 'Database tables and migrations',
   '[{"node_id": "db-1", "node_type": "schema", "path": "migrations", "name": "Migrations", "relationships": []}]'::jsonb,
   '["migrations"]'::jsonb,
   0.9)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DEFAULT REPOSITORY
-- ============================================================================

INSERT INTO repositories (repo_name, repo_url, local_path, branch)
VALUES
  ('LightDom', 'https://github.com/DashZeroAlionSystems/LightDom', '/home/runner/work/LightDom/LightDom', 'main')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kg_sections_updated_at BEFORE UPDATE ON knowledge_graph_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_knowledge_contexts_updated_at BEFORE UPDATE ON agent_knowledge_contexts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specializations_updated_at BEFORE UPDATE ON agent_specializations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repos_updated_at BEFORE UPDATE ON repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegation_rules_updated_at BEFORE UPDATE ON delegation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orchestration_configs_updated_at BEFORE UPDATE ON deepseek_orchestration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE knowledge_graph_sections IS 'Stores sections of the codebase knowledge graph for agent context';
COMMENT ON TABLE agent_knowledge_contexts IS 'Links agents to their specific knowledge graph sections';
COMMENT ON TABLE agent_navigation_rules IS 'Rules for determining which agents to include or exclude for tasks';
COMMENT ON TABLE agent_decision_contexts IS 'History of agent selection decisions made by orchestrator';
COMMENT ON TABLE agent_specializations IS 'Predefined agent specializations with capabilities and templates';
COMMENT ON TABLE repositories IS 'Git repositories that agents can work with';
COMMENT ON TABLE agent_repository_assignments IS 'Assigns repositories to specific agent instances';
COMMENT ON TABLE generated_prompts IS 'Prompts generated by orchestrator for delegated tasks';
COMMENT ON TABLE agent_fine_tune_jobs IS 'Fine-tuning jobs for agent instances';
COMMENT ON TABLE dom_layer_visualizations IS '3D DOM visualizations for agent context';
COMMENT ON TABLE visual_component_previews IS 'Preview renders of generated components';
COMMENT ON TABLE delegation_rules IS 'Rules for automatic task delegation';
COMMENT ON TABLE deepseek_orchestration_configs IS 'Configuration for DeepSeek orchestration per session';
