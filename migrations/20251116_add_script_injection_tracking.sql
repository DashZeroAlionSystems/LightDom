-- Migration: Add script injection tracking for client sites
-- Description: Adds fields to track header script injection and associated workflows
-- Created: 2025-11-16

-- Add script injection tracking fields to seo_clients table
ALTER TABLE seo_clients 
  ADD COLUMN IF NOT EXISTS script_injected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS script_injection_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS injection_workflow_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS monitoring_workflow_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS optimization_workflow_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS header_script_content TEXT,
  ADD COLUMN IF NOT EXISTS script_version VARCHAR(50) DEFAULT 'v1.0.0',
  ADD COLUMN IF NOT EXISTS last_script_update TIMESTAMP,
  ADD COLUMN IF NOT EXISTS auto_optimize BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS realtime_updates BOOLEAN DEFAULT TRUE;

-- Create index for quick lookup of injected clients
CREATE INDEX IF NOT EXISTS idx_seo_clients_script_injected ON seo_clients(script_injected);
CREATE INDEX IF NOT EXISTS idx_seo_clients_injection_workflow ON seo_clients(injection_workflow_id);

-- Create table for tracking script injection events
CREATE TABLE IF NOT EXISTS script_injection_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('injection', 'update', 'removal', 'error')),
  workflow_id VARCHAR(255),
  script_version VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'rolled_back')),
  details JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_script_injection_events_client ON script_injection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_script_injection_events_type ON script_injection_events(event_type);
CREATE INDEX IF NOT EXISTS idx_script_injection_events_status ON script_injection_events(status);
CREATE INDEX IF NOT EXISTS idx_script_injection_events_created ON script_injection_events(created_at DESC);

-- Create table for workflow execution logs
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  execution_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_workflow ON workflow_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_client ON workflow_execution_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_status ON workflow_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_started ON workflow_execution_logs(started_at DESC);

-- Add comment documentation
COMMENT ON COLUMN seo_clients.script_injected IS 'Whether the LightDom header script has been injected into client site';
COMMENT ON COLUMN seo_clients.injection_workflow_id IS 'Reference to the n8n workflow handling script injection';
COMMENT ON COLUMN seo_clients.monitoring_workflow_id IS 'Reference to the n8n workflow monitoring the client site';
COMMENT ON COLUMN seo_clients.optimization_workflow_id IS 'Reference to the n8n workflow performing optimizations';
COMMENT ON COLUMN seo_clients.header_script_content IS 'The actual header script content provided to the client';
COMMENT ON TABLE script_injection_events IS 'Tracks all script injection, update, and removal events';
COMMENT ON TABLE workflow_execution_logs IS 'Logs all workflow executions for debugging and monitoring';
