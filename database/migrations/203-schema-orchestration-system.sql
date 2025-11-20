-- Migration 203: Schema Orchestration System
-- Adds schema-driven workflow orchestration with MCP server integration

-- Workflow Templates
-- Reusable schema-based templates for generating workflows and campaigns
CREATE TABLE IF NOT EXISTS workflow_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active);

-- Schema Links
-- Defines relationships between schemas for structural mapping
CREATE TABLE IF NOT EXISTS schema_links (
  link_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_schema_id UUID NOT NULL,
  target_schema_id UUID NOT NULL,
  link_type VARCHAR(100) NOT NULL,  -- outputs_to, depends_on, extends, includes
  link_config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_schema_id, target_schema_id, link_type)
);

CREATE INDEX idx_schema_links_source ON schema_links(source_schema_id);
CREATE INDEX idx_schema_links_target ON schema_links(target_schema_id);
CREATE INDEX idx_schema_links_type ON schema_links(link_type);

-- Schema Hierarchies
-- Organizes schemas in hierarchical structures by use case
CREATE TABLE IF NOT EXISTS schema_hierarchies (
  hierarchy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  root_schema_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  parent_hierarchy_id UUID REFERENCES schema_hierarchies(hierarchy_id) ON DELETE CASCADE,
  use_case VARCHAR(255) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schema_hierarchies_use_case ON schema_hierarchies(use_case);
CREATE INDEX idx_schema_hierarchies_level ON schema_hierarchies(level);
CREATE INDEX idx_schema_hierarchies_parent ON schema_hierarchies(parent_hierarchy_id);

-- MCP Servers
-- Model Context Protocol servers for API extensibility
CREATE TABLE IF NOT EXISTS mcp_servers (
  server_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  endpoint_url VARCHAR(500) NOT NULL,
  auth_type VARCHAR(50) DEFAULT 'none',  -- none, api_key, oauth, basic
  auth_config JSONB,  -- Stores authentication credentials
  status VARCHAR(50) DEFAULT 'active',  -- active, offline, degraded
  config JSONB,  -- Additional server configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcp_servers_status ON mcp_servers(status);

-- MCP Capabilities
-- Tools and APIs available from MCP servers
CREATE TABLE IF NOT EXISTS mcp_capabilities (
  capability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES mcp_servers(server_id) ON DELETE CASCADE,
  capability_type VARCHAR(100) NOT NULL,  -- tool, api, function, service
  name VARCHAR(255) NOT NULL,
  description TEXT,
  input_schema JSONB,  -- Expected input format
  output_schema JSONB,  -- Expected output format
  config JSONB,  -- Additional capability configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(server_id, name)
);

CREATE INDEX idx_mcp_capabilities_server ON mcp_capabilities(server_id);
CREATE INDEX idx_mcp_capabilities_type ON mcp_capabilities(capability_type);
CREATE INDEX idx_mcp_capabilities_name ON mcp_capabilities(name);

-- Workflow Simulations
-- Test workflow execution without actually running it
CREATE TABLE IF NOT EXISTS workflow_simulations (
  simulation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  input_data JSONB NOT NULL,
  simulated_output JSONB,
  estimated_duration_ms INTEGER,
  resource_requirements JSONB,  -- cpu, memory, network estimates
  validation_results JSONB,  -- Configuration validation results
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_simulations_workflow ON workflow_simulations(workflow_id);
CREATE INDEX idx_workflow_simulations_created ON workflow_simulations(created_at DESC);

-- Add column to track template-generated workflows
ALTER TABLE agent_workflows ADD COLUMN IF NOT EXISTS generated_from_template_id UUID REFERENCES workflow_templates(template_id) ON DELETE SET NULL;

-- Add column to track template-generated campaigns
ALTER TABLE agent_campaigns ADD COLUMN IF NOT EXISTS generated_from_template_id UUID REFERENCES workflow_templates(template_id) ON DELETE SET NULL;

-- Seed data: Example workflow templates
INSERT INTO workflow_templates (name, description, category, schema) VALUES
(
  'SEO Analysis Pipeline',
  'Complete SEO analysis workflow from crawling to reporting',
  'seo',
  '{
    "steps": [
      {
        "name": "crawl_site",
        "service": "web_crawler",
        "config": {
          "depth": 3,
          "respectRobotsTxt": true,
          "maxConcurrent": 5
        }
      },
      {
        "name": "analyze_content",
        "service": "seo_analyzer",
        "config": {
          "checkKeywords": true,
          "checkMetaTags": true,
          "checkHeadings": true
        }
      },
      {
        "name": "generate_report",
        "service": "report_generator",
        "config": {
          "format": "pdf",
          "includeCharts": true
        }
      }
    ],
    "errorHandling": {
      "retryOnFailure": true,
      "maxRetries": 3
    }
  }'::jsonb
),
(
  'Content Generation Workflow',
  'Research, generate, and optimize content',
  'content',
  '{
    "steps": [
      {
        "name": "research_topic",
        "service": "content_researcher",
        "config": {
          "sources": ["web", "database"],
          "depth": "comprehensive"
        }
      },
      {
        "name": "generate_content",
        "service": "ai_writer",
        "config": {
          "model": "deepseek",
          "tone": "professional",
          "length": "medium"
        }
      },
      {
        "name": "optimize_seo",
        "service": "seo_optimizer",
        "config": {
          "targetKeywords": [],
          "optimizeReadability": true
        }
      }
    ]
  }'::jsonb
),
(
  'Security Audit Workflow',
  'Comprehensive security scanning and remediation',
  'security',
  '{
    "steps": [
      {
        "name": "scan_vulnerabilities",
        "service": "security_scanner",
        "config": {
          "scanTypes": ["xss", "sql_injection", "csrf"],
          "depth": "deep"
        }
      },
      {
        "name": "analyze_findings",
        "service": "security_analyzer",
        "config": {
          "prioritize": true,
          "severityThreshold": "medium"
        }
      },
      {
        "name": "generate_remediation",
        "service": "remediation_planner",
        "config": {
          "autoFix": false,
          "generateReport": true
        }
      }
    ]
  }'::jsonb
),
(
  'Data Mining Campaign',
  'Multi-stage data collection and analysis campaign',
  'data_mining',
  '{
    "workflows": [
      {
        "name": "Initial Collection",
        "template_id": null,
        "order": 0,
        "config": {
          "sources": ["web", "api"],
          "schedule": "hourly"
        }
      },
      {
        "name": "Processing Pipeline",
        "template_id": null,
        "order": 1,
        "config": {
          "processors": ["cleaner", "enricher", "analyzer"]
        }
      },
      {
        "name": "Reporting",
        "template_id": null,
        "order": 2,
        "config": {
          "frequency": "daily",
          "format": "dashboard"
        }
      }
    ],
    "schedule_config": {
      "frequency": "daily",
      "time": "02:00"
    }
  }'::jsonb
);

-- Comments
COMMENT ON TABLE workflow_templates IS 'Reusable schema-based templates for generating workflows and campaigns';
COMMENT ON TABLE schema_links IS 'Defines relationships between schemas for structural mapping';
COMMENT ON TABLE schema_hierarchies IS 'Organizes schemas in hierarchical structures by use case';
COMMENT ON TABLE mcp_servers IS 'Model Context Protocol servers for API extensibility';
COMMENT ON TABLE mcp_capabilities IS 'Tools and APIs available from MCP servers';
COMMENT ON TABLE workflow_simulations IS 'Test workflow execution without actually running it';
