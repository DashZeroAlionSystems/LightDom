-- Phase 3: Package Intelligence System Migration
-- Creates tables for competitor package tracking, trust ratings, and recommendations
-- Date: 2025-11-18

-- ============================================================================
-- Table 1: Insurance Providers
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_providers (
  id SERIAL PRIMARY KEY,
  provider_name VARCHAR(255) NOT NULL UNIQUE,
  provider_code VARCHAR(50) NOT NULL UNIQUE,
  website_url TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  headquarters_location VARCHAR(255),
  license_number VARCHAR(100),
  established_year INTEGER,
  member_count INTEGER,
  market_share_percentage DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  scrape_url TEXT,
  last_scraped_at TIMESTAMP,
  scrape_frequency VARCHAR(50) DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_providers_active ON insurance_providers(is_active);
CREATE INDEX idx_providers_code ON insurance_providers(provider_code);

-- ============================================================================
-- Table 2: Insurance Packages
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_packages (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  package_code VARCHAR(100) NOT NULL,
  package_tier VARCHAR(50), -- 'hospital_plan', 'comprehensive', 'savings', 'network'
  monthly_premium_single DECIMAL(10,2),
  monthly_premium_family DECIMAL(10,2),
  monthly_premium_couple DECIMAL(10,2),
  annual_premium_single DECIMAL(10,2),
  annual_premium_family DECIMAL(10,2),
  hospital_cover_level VARCHAR(100), -- 'private_ward', 'semi_private', 'general_ward'
  in_hospital_cover_limit DECIMAL(15,2),
  day_to_day_benefits BOOLEAN DEFAULT false,
  chronic_medication_cover BOOLEAN DEFAULT false,
  maternity_benefits BOOLEAN DEFAULT false,
  dental_benefits BOOLEAN DEFAULT false,
  optical_benefits BOOLEAN DEFAULT false,
  network_hospitals TEXT[], -- Array of hospital networks
  excluded_conditions TEXT[],
  waiting_periods JSONB, -- {general: 3, chronic: 12, maternity: 10}
  age_restrictions JSONB, -- {min: 0, max: 65}
  is_active BOOLEAN DEFAULT true,
  last_price_update TIMESTAMP,
  price_change_percentage DECIMAL(5,2),
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_id, package_code)
);

CREATE INDEX idx_packages_provider ON insurance_packages(provider_id);
CREATE INDEX idx_packages_tier ON insurance_packages(package_tier);
CREATE INDEX idx_packages_active ON insurance_packages(is_active);
CREATE INDEX idx_packages_premium_single ON insurance_packages(monthly_premium_single);

-- ============================================================================
-- Table 3: Package Benefits
-- ============================================================================
CREATE TABLE IF NOT EXISTS package_benefits (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES insurance_packages(id) ON DELETE CASCADE,
  benefit_category VARCHAR(100) NOT NULL, -- 'hospital', 'specialist', 'gp', 'chronic', 'dental', etc.
  benefit_name VARCHAR(255) NOT NULL,
  benefit_description TEXT,
  annual_limit DECIMAL(12,2),
  per_visit_limit DECIMAL(10,2),
  unlimited_cover BOOLEAN DEFAULT false,
  co_payment_percentage DECIMAL(5,2),
  co_payment_amount DECIMAL(10,2),
  requires_authorization BOOLEAN DEFAULT false,
  network_only BOOLEAN DEFAULT false,
  sub_limits JSONB, -- Additional constraints
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_benefits_package ON package_benefits(package_id);
CREATE INDEX idx_benefits_category ON package_benefits(benefit_category);

-- ============================================================================
-- Table 4: Competitor Pricing History
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES insurance_packages(id) ON DELETE CASCADE,
  price_date DATE NOT NULL,
  monthly_premium_single DECIMAL(10,2),
  monthly_premium_family DECIMAL(10,2),
  price_change_amount DECIMAL(10,2),
  price_change_percentage DECIMAL(5,2),
  price_change_reason VARCHAR(255),
  source VARCHAR(100), -- 'scraper', 'manual', 'provider_announcement'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(package_id, price_date)
);

CREATE INDEX idx_pricing_package ON competitor_pricing(package_id);
CREATE INDEX idx_pricing_date ON competitor_pricing(price_date DESC);

-- ============================================================================
-- Table 5: Trust Ratings
-- ============================================================================
CREATE TABLE IF NOT EXISTS trust_ratings (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  rating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Individual source ratings
  hello_peter_rating DECIMAL(3,2), -- 0-5 stars
  hello_peter_review_count INTEGER,
  hello_peter_positive_percentage DECIMAL(5,2),
  
  social_sentiment_score DECIMAL(5,2), -- -1 to +1, normalized to 0-100
  facebook_complaints_count INTEGER,
  twitter_mentions_count INTEGER,
  twitter_positive_percentage DECIMAL(5,2),
  reddit_mentions_count INTEGER,
  
  claims_approval_rate DECIMAL(5,2), -- 0-100%
  claims_processed_count INTEGER,
  average_claim_turnaround_days DECIMAL(5,2),
  
  customer_service_rating DECIMAL(5,2), -- 0-100
  customer_service_response_time_hours DECIMAL(5,2),
  
  financial_stability_score DECIMAL(5,2), -- 0-100 based on solvency ratios
  solvency_ratio DECIMAL(5,2),
  
  -- Composite score
  trust_score DECIMAL(5,2) NOT NULL, -- 0-100, weighted average
  
  -- Metadata
  data_sources TEXT[], -- ['hellopeter', 'facebook', 'twitter', 'reddit', 'google']
  total_reviews_processed INTEGER,
  confidence_level VARCHAR(20), -- 'high', 'medium', 'low'
  last_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(provider_id, rating_date)
);

CREATE INDEX idx_trust_provider ON trust_ratings(provider_id);
CREATE INDEX idx_trust_date ON trust_ratings(rating_date DESC);
CREATE INDEX idx_trust_score ON trust_ratings(trust_score DESC);

-- ============================================================================
-- Table 6: Social Sentiment Data
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_sentiment (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  source_platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'reddit', 'hellopeter', 'mybroadband'
  post_id VARCHAR(255),
  post_url TEXT,
  post_date TIMESTAMP,
  post_content TEXT,
  sentiment_classification VARCHAR(20), -- 'positive', 'neutral', 'negative'
  sentiment_score DECIMAL(5,2), -- -1 to +1
  complaint_category VARCHAR(100), -- 'claims', 'customer_service', 'pricing', 'coverage'
  is_resolved BOOLEAN DEFAULT false,
  engagement_count INTEGER, -- likes, shares, comments
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sentiment_provider ON social_sentiment(provider_id);
CREATE INDEX idx_sentiment_platform ON social_sentiment(source_platform);
CREATE INDEX idx_sentiment_date ON social_sentiment(post_date DESC);
CREATE INDEX idx_sentiment_classification ON social_sentiment(sentiment_classification);

-- ============================================================================
-- Table 7: Package Recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS package_recommendations (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL, -- References medical_leads(id)
  campaign_id VARCHAR(255),
  
  -- Lead profile
  lead_age INTEGER,
  lead_family_size INTEGER,
  lead_monthly_income DECIMAL(10,2),
  lead_health_status VARCHAR(50),
  lead_chronic_conditions TEXT[],
  lead_current_package_id INTEGER REFERENCES insurance_packages(id),
  lead_current_monthly_premium DECIMAL(10,2),
  
  -- Recommended package
  recommended_package_id INTEGER NOT NULL REFERENCES insurance_packages(id),
  recommendation_rank INTEGER, -- 1-5 (top 5 recommendations)
  recommendation_score DECIMAL(5,2), -- 0-100
  
  -- Savings analysis
  monthly_savings DECIMAL(10,2),
  annual_savings DECIMAL(10,2),
  savings_percentage DECIMAL(5,2),
  
  -- Coverage analysis
  coverage_improvement_percentage DECIMAL(5,2),
  coverage_gaps_addressed TEXT[],
  coverage_losses TEXT[],
  
  -- Switch timing
  optimal_switch_date DATE,
  days_until_optimal_switch INTEGER,
  switch_urgency VARCHAR(20), -- 'immediate', 'soon', 'planned', 'low'
  
  -- Reasoning
  recommendation_reason TEXT,
  affordability_score DECIMAL(5,2), -- 0-100
  coverage_adequacy_score DECIMAL(5,2), -- 0-100
  provider_trust_score DECIMAL(5,2), -- 0-100
  network_accessibility_score DECIMAL(5,2), -- 0-100
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW(),
  presented_to_lead BOOLEAN DEFAULT false,
  lead_action VARCHAR(50), -- 'interested', 'not_interested', 'converted', 'pending'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recommendations_lead ON package_recommendations(lead_id);
CREATE INDEX idx_recommendations_package ON package_recommendations(recommended_package_id);
CREATE INDEX idx_recommendations_rank ON package_recommendations(recommendation_rank);
CREATE INDEX idx_recommendations_score ON package_recommendations(recommendation_score DESC);

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insurance_providers_updated_at BEFORE UPDATE ON insurance_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_packages_updated_at BEFORE UPDATE ON insurance_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_benefits_updated_at BEFORE UPDATE ON package_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data: Insert major SA insurance providers
-- ============================================================================
INSERT INTO insurance_providers (provider_name, provider_code, website_url, market_share_percentage, scrape_url, scrape_frequency) VALUES
('Discovery Health', 'DISCOVERY', 'https://www.discovery.co.za', 32.5, 'https://www.discovery.co.za/medical-aid/medical-schemes/plans-and-benefits', 'daily'),
('Momentum Health', 'MOMENTUM', 'https://www.momentum.co.za', 14.2, 'https://www.momentum.co.za/for/you/medical-aid/health-plans', 'daily'),
('Bonitas', 'BONITAS', 'https://www.bonitas.co.za', 11.8, 'https://www.bonitas.co.za/our-products/medical-aid-plans', 'daily'),
('Fedhealth', 'FEDHEALTH', 'https://www.fedhealth.co.za', 8.5, 'https://www.fedhealth.co.za/products/options', 'weekly'),
('GEMS', 'GEMS', 'https://www.gems.gov.za', 7.3, 'https://www.gems.gov.za/benefits/options', 'weekly'),
('Bestmed', 'BESTMED', 'https://www.bestmed.co.za', 6.1, 'https://www.bestmed.co.za/medical-aid-plans', 'weekly'),
('Medihelp', 'MEDIHELP', 'https://www.medihelp.co.za', 5.4, 'https://www.medihelp.co.za/products/plans', 'weekly'),
('CompCare', 'COMPCARE', 'https://www.compcare.co.za', 4.2, 'https://www.compcare.co.za/medical-aid-options', 'weekly')
ON CONFLICT (provider_code) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE insurance_providers IS 'South African medical insurance providers with scraping configuration';
COMMENT ON TABLE insurance_packages IS 'All available medical aid packages from tracked providers';
COMMENT ON TABLE package_benefits IS 'Detailed benefit breakdown for each package';
COMMENT ON TABLE competitor_pricing IS 'Historical pricing data for competitive analysis';
COMMENT ON TABLE trust_ratings IS 'Multi-source trust scores for providers';
COMMENT ON TABLE social_sentiment IS 'Social media sentiment and complaint tracking';
COMMENT ON TABLE package_recommendations IS 'AI-powered package recommendations for leads';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Total tables created: 7
-- Total indexes created: 20+
-- Total triggers created: 3
-- Sample providers inserted: 8
