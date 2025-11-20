/**
 * Database Migration: Medical Leads System
 * 
 * Purpose: Create tables for medical insurance lead generation campaign
 * Date: 2025-11-18
 * Author: Copilot
 * 
 * Dependencies:
 * - Requires: crawler_campaigns table (from crawler-campaign-tables.sql)
 * - Creates: medical_leads, raw_data_dumps, custom_clients, lead_qualification_rules, cluster_campaigns
 * 
 * Notes:
 * - Designed for 24/7 operation with legal compliance
 * - Supports schema.org/MedicalOrganization standard
 * - Includes GDPR/POPIA compliance fields
 */

-- ============================================================================
-- Raw Data Storage Layer
-- ============================================================================

CREATE TABLE IF NOT EXISTS raw_data_dumps (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  source_url TEXT,
  data_type VARCHAR(100),
  raw_content JSONB NOT NULL,
  file_size_mb DECIMAL(10,2),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMP,
  error_message TEXT,
  
  -- Metadata
  extraction_method VARCHAR(100),
  schema_matched VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raw_dumps_campaign ON raw_data_dumps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_raw_dumps_status ON raw_data_dumps(processing_status);
CREATE INDEX IF NOT EXISTS idx_raw_dumps_ingestion ON raw_data_dumps(ingestion_timestamp DESC);

-- ============================================================================
-- Medical Leads Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS medical_leads (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  raw_data_id INTEGER REFERENCES raw_data_dumps(id) ON DELETE SET NULL,
  
  -- Organization Information (schema.org/MedicalOrganization)
  company_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100), -- 'medical_aid', 'health_insurance', 'medical_scheme'
  
  -- Contact Information
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Africa',
  
  -- Additional Details
  website_url TEXT,
  description TEXT,
  services_offered JSONB,
  coverage_types JSONB,
  pricing_info JSONB,
  
  -- Schema.org compliance
  schema_type VARCHAR(100) DEFAULT 'schema.org/MedicalOrganization',
  schema_data JSONB,
  
  -- Lead Qualification
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  qualification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'qualified', 'disqualified', 'contacted', 'converted'
  qualification_notes TEXT,
  
  -- Quality Metrics
  data_completeness DECIMAL(5,2), -- Percentage of required fields filled
  contact_verified BOOLEAN DEFAULT false,
  region_verified BOOLEAN DEFAULT false,
  
  -- Legal Compliance (GDPR/POPIA)
  consent_obtained BOOLEAN DEFAULT false,
  opt_out_requested BOOLEAN DEFAULT false,
  data_source_legal BOOLEAN DEFAULT true,
  privacy_policy_url TEXT,
  
  -- Timestamps
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contacted TIMESTAMP,
  converted_at TIMESTAMP,
  
  -- Deduplication
  data_hash VARCHAR(64) UNIQUE -- Hash of key fields for deduplication
);

CREATE INDEX IF NOT EXISTS idx_medical_leads_campaign ON medical_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_medical_leads_status ON medical_leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_medical_leads_score ON medical_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_medical_leads_country ON medical_leads(country);
CREATE INDEX IF NOT EXISTS idx_medical_leads_province ON medical_leads(province);
CREATE INDEX IF NOT EXISTS idx_medical_leads_discovered ON medical_leads(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_leads_hash ON medical_leads(data_hash);
CREATE INDEX IF NOT EXISTS idx_medical_leads_email ON medical_leads(contact_email) WHERE contact_email IS NOT NULL;

-- ============================================================================
-- Custom Clients Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  company_legal_name VARCHAR(255),
  
  -- Contact Information
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  
  -- Campaign Configuration
  campaign_schemas JSONB DEFAULT '[]'::jsonb, -- Array of schema definitions
  allowed_campaign_types JSONB DEFAULT '["lead_generation"]'::jsonb,
  
  -- Quotas and Limits
  data_quotas JSONB DEFAULT '{"leads_per_month": 1000, "campaigns": 5}'::jsonb,
  current_usage JSONB DEFAULT '{"leads_this_month": 0, "active_campaigns": 0}'::jsonb,
  
  -- Billing
  billing_type VARCHAR(50) DEFAULT 'custom_contract', -- 'custom_contract', 'pay_per_lead', 'monthly_subscription'
  billing_rate DECIMAL(10,2),
  billing_currency VARCHAR(3) DEFAULT 'ZAR',
  
  -- Access Control
  client_type VARCHAR(50) DEFAULT 'custom', -- 'custom', 'enterprise', 'standard'
  admin_approved BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'cancelled'
  
  -- API Access
  api_key_hash VARCHAR(255),
  api_rate_limit INTEGER DEFAULT 100, -- requests per hour
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  suspended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_clients_status ON custom_clients(status);
CREATE INDEX IF NOT EXISTS idx_custom_clients_type ON custom_clients(client_type);
CREATE INDEX IF NOT EXISTS idx_custom_clients_created ON custom_clients(created_at DESC);

-- ============================================================================
-- Lead Qualification Rules Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_qualification_rules (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'required_field', 'data_quality', 'geographic', 'scoring'
  
  -- Rule Configuration
  conditions JSONB NOT NULL, -- Rule logic as JSON
  weight INTEGER DEFAULT 10, -- Weight for scoring rules
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  
  -- Execution Stats
  times_applied INTEGER DEFAULT 0,
  times_passed INTEGER DEFAULT 0,
  times_failed INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qualification_rules_campaign ON lead_qualification_rules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_qualification_rules_type ON lead_qualification_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_qualification_rules_enabled ON lead_qualification_rules(enabled);

-- ============================================================================
-- Cluster Campaigns Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS cluster_campaigns (
  id VARCHAR(255) PRIMARY KEY,
  cluster_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Campaign IDs in this cluster
  campaign_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of campaign IDs
  
  -- Shared Configuration
  shared_resources JSONB DEFAULT '{"url_seeds": true, "schema_registry": true, "analytics": true}'::jsonb,
  resource_allocation JSONB, -- How resources are shared between campaigns
  
  -- Coordination
  execution_strategy VARCHAR(50) DEFAULT 'parallel', -- 'parallel', 'sequential', 'round_robin'
  priority_order JSONB, -- Array of campaign IDs in priority order
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed'
  
  -- Analytics
  total_leads_generated INTEGER DEFAULT 0,
  total_urls_crawled INTEGER DEFAULT 0,
  cluster_performance_score DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  stopped_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cluster_campaigns_status ON cluster_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_cluster_campaigns_created ON cluster_campaigns(created_at DESC);

-- ============================================================================
-- Campaign SEO Integration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_seo_integration (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  cluster_id VARCHAR(255) REFERENCES cluster_campaigns(id) ON DELETE SET NULL,
  
  -- SEO Configuration
  seo_enabled BOOLEAN DEFAULT true,
  target_keywords JSONB DEFAULT '[]'::jsonb,
  competitor_urls JSONB DEFAULT '[]'::jsonb,
  
  -- SEO Metrics
  average_page_rank DECIMAL(5,2),
  backlinks_discovered INTEGER DEFAULT 0,
  content_quality_score DECIMAL(5,2),
  
  -- Optimization Settings
  auto_optimization BOOLEAN DEFAULT true,
  optimization_frequency VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  
  -- Results
  seo_improvements JSONB,
  ranking_changes JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_integration_campaign ON campaign_seo_integration(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seo_integration_cluster ON campaign_seo_integration(cluster_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at trigger for medical_leads
CREATE TRIGGER update_medical_leads_updated_at
    BEFORE UPDATE ON medical_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at trigger for custom_clients
CREATE TRIGGER update_custom_clients_updated_at
    BEFORE UPDATE ON custom_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at trigger for lead_qualification_rules
CREATE TRIGGER update_qualification_rules_updated_at
    BEFORE UPDATE ON lead_qualification_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at trigger for cluster_campaigns
CREATE TRIGGER update_cluster_campaigns_updated_at
    BEFORE UPDATE ON cluster_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at trigger for campaign_seo_integration
CREATE TRIGGER update_seo_integration_updated_at
    BEFORE UPDATE ON campaign_seo_integration
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE raw_data_dumps IS 'Stores raw unstructured data before processing into structured records';
COMMENT ON TABLE medical_leads IS 'Qualified medical insurance leads with schema.org compliance';
COMMENT ON TABLE custom_clients IS 'Custom clients outside standard paid plans with flexible configurations';
COMMENT ON TABLE lead_qualification_rules IS 'Configurable rules for lead qualification and scoring';
COMMENT ON TABLE cluster_campaigns IS 'Groups related campaigns for coordinated execution and resource sharing';
COMMENT ON TABLE campaign_seo_integration IS 'SEO campaign integration settings and metrics';

COMMENT ON COLUMN medical_leads.lead_score IS 'Calculated score 0-100 based on qualification rules';
COMMENT ON COLUMN medical_leads.data_completeness IS 'Percentage of required fields populated';
COMMENT ON COLUMN medical_leads.data_hash IS 'MD5/SHA hash of key fields for duplicate detection';
COMMENT ON COLUMN custom_clients.billing_type IS 'Custom contract, pay per lead, or monthly subscription';
