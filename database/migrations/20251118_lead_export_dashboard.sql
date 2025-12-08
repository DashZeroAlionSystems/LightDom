/**
 * Database Migration: Lead Export and Dashboard System
 * 
 * Purpose: Add tables for daily lead exports and dashboard analytics
 * Date: 2025-11-18
 * Author: Copilot
 * 
 * Dependencies:
 * - Requires: medical_leads table (from 20251118_medical_leads_system.sql)
 * 
 * Notes:
 * - Supports CSV and Excel export formats
 * - Tracks export history and download links
 * - Provides dashboard metrics aggregation
 */

-- ============================================================================
-- Lead Export History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_exports (
  id SERIAL PRIMARY KEY,
  export_date DATE DEFAULT CURRENT_DATE,
  export_type VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'manual', 'api'
  
  -- Export Configuration
  campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  format VARCHAR(10) NOT NULL, -- 'csv' or 'excel'
  
  -- Export Stats
  lead_count INTEGER DEFAULT 0,
  qualified_count INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  
  -- File Information
  file_path TEXT NOT NULL,
  file_size_mb DECIMAL(10,2),
  
  -- Filters Applied
  filters_applied JSONB DEFAULT '{}'::jsonb,
  date_range JSONB, -- {"from": "2025-01-01", "to": "2025-01-31"}
  
  -- Status
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  
  -- User Information
  exported_by VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exports_date ON lead_exports(export_date DESC);
CREATE INDEX IF NOT EXISTS idx_exports_campaign ON lead_exports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON lead_exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created ON lead_exports(created_at DESC);

-- ============================================================================
-- Dashboard Metrics Table (Materialized View Support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE DEFAULT CURRENT_DATE,
  campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  
  -- Lead Metrics
  leads_generated INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  
  -- Quality Metrics
  average_lead_score DECIMAL(5,2),
  average_data_completeness DECIMAL(5,2),
  
  -- Source Breakdown
  sources_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Conversion Funnel
  conversion_rate DECIMAL(5,2),
  qualification_rate DECIMAL(5,2),
  
  -- Performance Metrics
  pages_crawled INTEGER DEFAULT 0,
  urls_discovered INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  
  -- Timestamp
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one entry per campaign per day
  UNIQUE(metric_date, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_metrics_date ON dashboard_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_campaign ON dashboard_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_metrics_calculated ON dashboard_metrics(calculated_at DESC);

-- ============================================================================
-- Lead Activity Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_activity_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES medical_leads(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type VARCHAR(100) NOT NULL, -- 'qualified', 'contacted', 'exported', 'converted', 'disqualified'
  activity_description TEXT,
  
  -- Actor Information
  performed_by VARCHAR(255), -- user_id or 'system'
  performed_via VARCHAR(100), -- 'dashboard', 'api', 'automated'
  
  -- Additional Data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_lead ON lead_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON lead_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON lead_activity_log(created_at DESC);

-- ============================================================================
-- Export Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS export_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Template Configuration
  columns JSONB NOT NULL, -- Array of column definitions
  filters JSONB DEFAULT '{}'::jsonb,
  sort_order JSONB,
  
  -- Formatting
  format_options JSONB DEFAULT '{}'::jsonb, -- Excel styling, CSV delimiter, etc.
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Ownership
  created_by VARCHAR(255),
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_name ON export_templates(template_name);
CREATE INDEX IF NOT EXISTS idx_templates_public ON export_templates(is_public);

-- ============================================================================
-- Scheduled Exports Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_exports (
  id SERIAL PRIMARY KEY,
  schedule_name VARCHAR(255) NOT NULL,
  
  -- Schedule Configuration
  frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  time_of_day TIME NOT NULL, -- e.g., '06:00:00'
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  
  -- Export Configuration
  campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES export_templates(id) ON DELETE SET NULL,
  format VARCHAR(10) DEFAULT 'csv',
  
  -- Delivery Configuration
  delivery_method VARCHAR(50) DEFAULT 'file', -- 'file', 'email', 'api'
  delivery_config JSONB, -- email addresses, API endpoints, etc.
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_enabled ON scheduled_exports(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_next_run ON scheduled_exports(next_run_at);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at for export_templates
CREATE TRIGGER update_export_templates_updated_at
    BEFORE UPDATE ON export_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for scheduled_exports
CREATE TRIGGER update_scheduled_exports_updated_at
    BEFORE UPDATE ON scheduled_exports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Functions for Dashboard Metrics Calculation
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_daily_metrics(p_campaign_id VARCHAR, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO dashboard_metrics (
    metric_date,
    campaign_id,
    leads_generated,
    leads_qualified,
    leads_contacted,
    leads_converted,
    average_lead_score,
    average_data_completeness,
    qualification_rate,
    conversion_rate
  )
  SELECT
    p_date,
    p_campaign_id,
    COUNT(*) as leads_generated,
    COUNT(*) FILTER (WHERE qualification_status = 'qualified') as leads_qualified,
    COUNT(*) FILTER (WHERE qualification_status = 'contacted') as leads_contacted,
    COUNT(*) FILTER (WHERE qualification_status = 'converted') as leads_converted,
    AVG(lead_score) as average_lead_score,
    AVG(data_completeness) as average_data_completeness,
    (COUNT(*) FILTER (WHERE qualification_status = 'qualified')::DECIMAL / NULLIF(COUNT(*), 0) * 100) as qualification_rate,
    (COUNT(*) FILTER (WHERE qualification_status = 'converted')::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE qualification_status = 'qualified'), 0) * 100) as conversion_rate
  FROM medical_leads
  WHERE campaign_id = p_campaign_id
    AND DATE(discovered_at) = p_date
  ON CONFLICT (metric_date, campaign_id) DO UPDATE SET
    leads_generated = EXCLUDED.leads_generated,
    leads_qualified = EXCLUDED.leads_qualified,
    leads_contacted = EXCLUDED.leads_contacted,
    leads_converted = EXCLUDED.leads_converted,
    average_lead_score = EXCLUDED.average_lead_score,
    average_data_completeness = EXCLUDED.average_data_completeness,
    qualification_rate = EXCLUDED.qualification_rate,
    conversion_rate = EXCLUDED.conversion_rate,
    calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE lead_exports IS 'Tracks all lead export operations with file paths and statistics';
COMMENT ON TABLE dashboard_metrics IS 'Daily aggregated metrics for dashboard visualization';
COMMENT ON TABLE lead_activity_log IS 'Audit trail of all lead-related activities';
COMMENT ON TABLE export_templates IS 'Reusable export templates with column and filter configurations';
COMMENT ON TABLE scheduled_exports IS 'Automated export schedules for daily/weekly/monthly reports';

COMMENT ON FUNCTION calculate_daily_metrics IS 'Calculates and stores daily metrics for a campaign';
