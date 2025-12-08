-- Lead Generation System Migration
-- Creates tables for capturing and managing leads from crawling campaigns

-- Drop existing tables if they exist (for idempotency)
DROP TABLE IF EXISTS lead_activities CASCADE;
DROP TABLE IF EXISTS lead_sources CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS lead_tags CASCADE;

-- Leads table - stores all captured leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(500),
  job_title VARCHAR(255),
  
  -- Lead status and scoring
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  score INTEGER DEFAULT 0, -- 0-100 lead score based on engagement
  quality VARCHAR(20) DEFAULT 'unknown', -- high, medium, low, unknown
  
  -- Source tracking
  source_type VARCHAR(100), -- crawler_campaign, seo_campaign, form_submission, api
  source_id VARCHAR(255), -- ID of the campaign or source
  source_url VARCHAR(1000), -- URL where lead was captured
  source_metadata JSONB DEFAULT '{}', -- Additional source information
  
  -- Contact information
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  
  -- Enrichment data
  social_profiles JSONB DEFAULT '{}', -- LinkedIn, Twitter, etc.
  company_data JSONB DEFAULT '{}', -- Industry, size, revenue, etc.
  interests JSONB DEFAULT '[]', -- Array of interest tags
  
  -- Tracking
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  conversion_date TIMESTAMP,
  
  -- Assignment
  assigned_to VARCHAR(255), -- User ID or sales rep email
  assigned_at TIMESTAMP,
  
  -- Notes and custom fields
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure email uniqueness
  UNIQUE(email)
);

-- Lead sources table - tracks where leads come from
CREATE TABLE IF NOT EXISTS lead_sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100) NOT NULL, -- crawler_campaign, seo_campaign, form, api, etc.
  source_config JSONB DEFAULT '{}', -- Configuration for the source
  
  -- Stats
  total_leads INTEGER DEFAULT 0,
  active_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead activities table - tracks all interactions with leads
CREATE TABLE IF NOT EXISTS lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  activity_type VARCHAR(100) NOT NULL, -- email_sent, email_opened, page_visit, form_submit, call, meeting, note
  activity_description TEXT,
  activity_data JSONB DEFAULT '{}', -- Additional activity details
  
  -- Attribution
  performed_by VARCHAR(255), -- User ID or system
  campaign_id VARCHAR(255), -- Related campaign if any
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead tags table - for categorizing leads
CREATE TABLE IF NOT EXISTS lead_tags (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(lead_id, tag)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_quality ON leads(quality);
CREATE INDEX IF NOT EXISTS idx_leads_source_type ON leads(source_type);
CREATE INDEX IF NOT EXISTS idx_leads_source_id ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_first_seen ON leads(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON leads(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON lead_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tags_tag ON lead_tags(tag);

-- GIN indexes for JSON  fields
CREATE INDEX IF NOT EXISTS idx_leads_source_metadata ON leads USING GIN (source_metadata);
CREATE INDEX IF NOT EXISTS idx_leads_company_data ON leads USING GIN (company_data);
CREATE INDEX IF NOT EXISTS idx_leads_interests ON leads USING GIN (interests);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at_trigger
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Trigger to update last_activity_at when activities are added
CREATE OR REPLACE FUNCTION update_lead_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads 
  SET last_activity_at = CURRENT_TIMESTAMP
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_activity_timestamp_trigger
  AFTER INSERT ON lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_last_activity();

-- View for lead statistics
CREATE OR REPLACE VIEW lead_statistics AS
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
  COUNT(CASE WHEN quality = 'high' THEN 1 END) as high_quality_leads,
  AVG(score) as average_score,
  COUNT(DISTINCT source_type) as unique_sources,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_last_7_days,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as leads_last_30_days
FROM leads;

-- View for lead source performance
CREATE OR REPLACE VIEW lead_source_performance AS
SELECT 
  source_type,
  source_id,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
  ROUND(COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate,
  AVG(score) as avg_lead_score,
  COUNT(CASE WHEN quality = 'high' THEN 1 END) as high_quality_count,
  MAX(created_at) as last_lead_captured
FROM leads
GROUP BY source_type, source_id;

-- View for assigned leads
CREATE OR REPLACE VIEW assigned_leads_summary AS
SELECT 
  assigned_to,
  COUNT(*) as total_assigned,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
  COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_count,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_count,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,
  AVG(score) as avg_score
FROM leads
WHERE assigned_to IS NOT NULL
GROUP BY assigned_to;

COMMENT ON TABLE leads IS 'Stores all captured leads from various sources including crawler campaigns';
COMMENT ON TABLE lead_sources IS 'Tracks lead sources and their performance metrics';
COMMENT ON TABLE lead_activities IS 'Records all activities and interactions with leads';
COMMENT ON TABLE lead_tags IS 'Tags for categorizing and filtering leads';
