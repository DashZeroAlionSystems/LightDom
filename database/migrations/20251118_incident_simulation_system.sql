-- Migration: Incident Simulation Engine System
-- Description: Creates tables for "what-if" scenario analysis, claims prediction, and action guidelines
-- Date: 2025-11-18
-- Phase: 4

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: incident_types
-- Purpose: Categorizes different types of medical incidents
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_types (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- accident, surgery, emergency, chronic, maternity, dental, optical
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity_level VARCHAR(50), -- low, medium, high, critical
  typical_cost_range_min DECIMAL(10,2),
  typical_cost_range_max DECIMAL(10,2),
  common_procedures TEXT[], -- Array of common procedure IDs
  authorization_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_types_category ON incident_types(category);
CREATE INDEX IF NOT EXISTS idx_incident_types_severity ON incident_types(severity_level);

-- ============================================================================
-- TABLE: medical_procedures
-- Purpose: Comprehensive database of medical procedures with costs and requirements
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_procedures (
  id SERIAL PRIMARY KEY,
  procedure_code VARCHAR(50) UNIQUE NOT NULL, -- ICD-10 code
  procedure_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- surgery, diagnostic, emergency, therapy, consultation
  description TEXT,
  average_cost_private DECIMAL(10,2),
  average_cost_public DECIMAL(10,2),
  requires_hospital BOOLEAN DEFAULT false,
  requires_specialist BOOLEAN DEFAULT false,
  authorization_level VARCHAR(50), -- none, pre_auth, emergency, specialist
  typical_duration_hours INTEGER,
  recovery_days INTEGER,
  network_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedures_code ON medical_procedures(procedure_code);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON medical_procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_cost ON medical_procedures(average_cost_private);

-- ============================================================================
-- TABLE: coverage_rules
-- Purpose: Package-specific coverage rules for procedures
-- ============================================================================
CREATE TABLE IF NOT EXISTS coverage_rules (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES insurance_packages(id) ON DELETE CASCADE,
  procedure_id INTEGER REFERENCES medical_procedures(id) ON DELETE CASCADE,
  coverage_percentage DECIMAL(5,2) DEFAULT 100.00, -- 0-100%
  annual_limit DECIMAL(10,2),
  per_event_limit DECIMAL(10,2),
  co_payment_amount DECIMAL(10,2),
  co_payment_percentage DECIMAL(5,2),
  deductible_amount DECIMAL(10,2),
  requires_pre_auth BOOLEAN DEFAULT false,
  waiting_period_days INTEGER DEFAULT 0,
  network_only BOOLEAN DEFAULT false,
  exclusions TEXT,
  sub_limits JSONB, -- Additional limits for specific aspects
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(package_id, procedure_id)
);

CREATE INDEX IF NOT EXISTS idx_coverage_package ON coverage_rules(package_id);
CREATE INDEX IF NOT EXISTS idx_coverage_procedure ON coverage_rules(procedure_id);
CREATE INDEX IF NOT EXISTS idx_coverage_percentage ON coverage_rules(coverage_percentage);

-- ============================================================================
-- TABLE: simulation_scenarios
-- Purpose: Stores user-created "what-if" scenarios and results
-- ============================================================================
CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  lead_id INTEGER REFERENCES medical_leads(id) ON DELETE SET NULL,
  scenario_name VARCHAR(255),
  incident_type_id INTEGER REFERENCES incident_types(id) ON DELETE SET NULL,
  package_id INTEGER REFERENCES insurance_packages(id) ON DELETE CASCADE,
  procedures JSONB NOT NULL, -- Array of procedure IDs and quantities
  additional_factors JSONB, -- network_status, pre_auth_obtained, etc.
  
  -- Results
  total_estimated_cost DECIMAL(10,2),
  covered_amount DECIMAL(10,2),
  out_of_pocket_amount DECIMAL(10,2),
  coverage_percentage DECIMAL(5,2),
  approval_likelihood_score INTEGER CHECK (approval_likelihood_score >= 0 AND approval_likelihood_score <= 100),
  confidence_level VARCHAR(50), -- low, medium, high
  
  -- Analysis
  risk_factors TEXT[],
  recommendations TEXT[],
  alternative_packages JSONB, -- Suggestions for better coverage
  gap_cover_recommended DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_lead ON simulation_scenarios(lead_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_package ON simulation_scenarios(package_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_likelihood ON simulation_scenarios(approval_likelihood_score);
CREATE INDEX IF NOT EXISTS idx_scenarios_created ON simulation_scenarios(created_at);

-- ============================================================================
-- TABLE: claims_history
-- Purpose: Historical claims data for ML model training (anonymized)
-- ============================================================================
CREATE TABLE IF NOT EXISTS claims_history (
  id SERIAL PRIMARY KEY,
  claim_reference VARCHAR(100) UNIQUE,
  provider_id INTEGER REFERENCES insurance_providers(id) ON DELETE SET NULL,
  package_id INTEGER REFERENCES insurance_packages(id) ON DELETE SET NULL,
  incident_type_id INTEGER REFERENCES incident_types(id) ON DELETE SET NULL,
  procedures JSONB NOT NULL, -- Array of procedures involved
  
  -- Claim details
  claim_date DATE NOT NULL,
  claim_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  rejected_amount DECIMAL(10,2),
  outcome VARCHAR(50) NOT NULL, -- approved, partial, rejected, pending
  rejection_reason TEXT,
  
  -- Context factors
  network_compliant BOOLEAN,
  pre_auth_obtained BOOLEAN,
  documentation_score INTEGER CHECK (documentation_score >= 0 AND documentation_score <= 100),
  policy_age_days INTEGER, -- Days since policy started
  previous_claims_count INTEGER DEFAULT 0,
  chronic_conditions TEXT[],
  emergency_claim BOOLEAN DEFAULT false,
  
  -- Processing
  processing_days INTEGER,
  disputed BOOLEAN DEFAULT false,
  dispute_outcome VARCHAR(50),
  
  -- Privacy
  anonymized BOOLEAN DEFAULT true,
  source VARCHAR(100), -- internal, social_media, public_data
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_provider ON claims_history(provider_id);
CREATE INDEX IF NOT EXISTS idx_claims_package ON claims_history(package_id);
CREATE INDEX IF NOT EXISTS idx_claims_outcome ON claims_history(outcome);
CREATE INDEX IF NOT EXISTS idx_claims_date ON claims_history(claim_date);
CREATE INDEX IF NOT EXISTS idx_claims_source ON claims_history(source);

-- ============================================================================
-- TABLE: procedure_guidelines
-- Purpose: Step-by-step action guides for specific incidents and packages
-- ============================================================================
CREATE TABLE IF NOT EXISTS procedure_guidelines (
  id SERIAL PRIMARY KEY,
  incident_type_id INTEGER REFERENCES incident_types(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES insurance_packages(id) ON DELETE CASCADE,
  provider_id INTEGER REFERENCES insurance_providers(id) ON DELETE CASCADE,
  
  -- Guide content
  title VARCHAR(255) NOT NULL,
  immediate_actions JSONB, -- Array of immediate steps
  pre_procedure_steps JSONB, -- Steps before procedure
  during_procedure_steps JSONB, -- Real-time actions
  post_procedure_steps JSONB, -- After procedure
  
  -- Contact information
  emergency_numbers JSONB,
  pre_auth_contact JSONB,
  claims_contact JSONB,
  
  -- Documentation requirements
  required_documents TEXT[],
  timeline_days INTEGER, -- Submission deadline
  common_pitfalls TEXT[],
  cost_saving_tips TEXT[],
  
  -- Network guidance
  recommended_providers JSONB,
  network_hospital_list TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(incident_type_id, package_id)
);

CREATE INDEX IF NOT EXISTS idx_guidelines_incident ON procedure_guidelines(incident_type_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_package ON procedure_guidelines(package_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_provider ON procedure_guidelines(provider_id);

-- ============================================================================
-- Seed Data: Common Incident Types
-- ============================================================================
INSERT INTO incident_types (category, name, description, severity_level, typical_cost_range_min, typical_cost_range_max, authorization_required) VALUES
('accident', 'Car Accident with Injuries', 'Vehicle collision requiring medical treatment', 'high', 50000, 250000, true),
('accident', 'Home Accident - Fall', 'Domestic fall requiring emergency care', 'medium', 15000, 80000, false),
('accident', 'Sports Injury', 'Athletic injury requiring orthopedic treatment', 'medium', 20000, 100000, true),
('accident', 'Work-Related Injury', 'Occupational injury requiring medical care', 'medium', 25000, 120000, true),

('surgery', 'Appendectomy (Emergency)', 'Emergency appendix removal', 'high', 35000, 65000, false),
('surgery', 'Cesarean Section', 'Surgical childbirth delivery', 'high', 80000, 150000, true),
('surgery', 'Orthopedic Surgery', 'Bone/joint surgical repair', 'high', 60000, 200000, true),
('surgery', 'Cardiac Surgery', 'Heart-related surgical procedures', 'critical', 250000, 800000, true),

('emergency', 'Heart Attack', 'Acute myocardial infarction', 'critical', 100000, 350000, false),
('emergency', 'Stroke', 'Cerebrovascular accident', 'critical', 120000, 400000, false),
('emergency', 'Severe Trauma', 'Multiple injuries requiring ICU', 'critical', 200000, 600000, false),

('chronic', 'Diabetes Management', 'Ongoing diabetes treatment and monitoring', 'medium', 5000, 20000, false),
('chronic', 'Hypertension Treatment', 'Blood pressure management', 'low', 3000, 12000, false),
('chronic', 'Asthma Control', 'Chronic respiratory condition management', 'medium', 4000, 18000, false),

('maternity', 'Normal Delivery', 'Natural childbirth', 'medium', 25000, 55000, true),
('maternity', 'Pregnancy Complications', 'High-risk pregnancy requiring specialist care', 'high', 80000, 200000, true),

('dental', 'Dental Emergency', 'Acute dental pain or trauma', 'low', 2000, 8000, false),
('optical', 'Eye Emergency', 'Acute vision problem or injury', 'medium', 3000, 15000, false)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed Data: Sample Medical Procedures (Top 50 most common)
-- ============================================================================
INSERT INTO medical_procedures (procedure_code, procedure_name, category, average_cost_private, average_cost_public, requires_hospital, requires_specialist, authorization_level, typical_duration_hours, recovery_days) VALUES
('ER001', 'Emergency Room Admission', 'emergency', 5000, 1000, true, false, 'emergency', 4, 0),
('CT001', 'CT Scan - Head/Brain', 'diagnostic', 3500, 500, true, false, 'pre_auth', 1, 0),
('CT002', 'CT Scan - Chest', 'diagnostic', 3200, 450, true, false, 'pre_auth', 1, 0),
('MRI001', 'MRI - Full Body', 'diagnostic', 8000, 1200, true, false, 'pre_auth', 2, 0),
('XRAY001', 'X-Ray - Multiple Views', 'diagnostic', 800, 150, false, false, 'none', 1, 0),

('SURG001', 'Appendectomy', 'surgery', 45000, 8000, true, true, 'emergency', 2, 7),
('SURG002', 'Cesarean Section', 'surgery', 65000, 12000, true, true, 'pre_auth', 1, 14),
('SURG003', 'Orthopedic Surgery - Fracture Repair', 'surgery', 85000, 15000, true, true, 'pre_auth', 3, 21),
('SURG004', 'Cardiac Bypass Surgery', 'surgery', 450000, 80000, true, true, 'specialist', 6, 60),
('SURG005', 'Hip Replacement', 'surgery', 180000, 35000, true, true, 'pre_auth', 4, 90),

('HOSP001', 'General Ward - Per Day', 'hospitalization', 3500, 800, true, false, 'none', 24, 0),
('HOSP002', 'ICU - Per Day', 'hospitalization', 18000, 3500, true, false, 'none', 24, 0),
('HOSP003', 'High Care - Per Day', 'hospitalization', 9000, 1800, true, false, 'none', 24, 0),
('HOSP004', 'Maternity Ward - Per Day', 'hospitalization', 4000, 900, true, false, 'none', 24, 0),

('THER001', 'Physical Therapy Session', 'therapy', 850, 200, false, false, 'none', 1, 0),
('THER002', 'Occupational Therapy Session', 'therapy', 900, 220, false, false, 'none', 1, 0),
('THER003', 'Speech Therapy Session', 'therapy', 800, 180, false, false, 'none', 1, 0),

('CONS001', 'Specialist Consultation', 'consultation', 1200, 350, false, true, 'none', 1, 0),
('CONS002', 'GP Consultation', 'consultation', 450, 150, false, false, 'none', 1, 0),
('CONS003', 'Emergency Physician Consultation', 'consultation', 2500, 600, true, false, 'none', 1, 0),

('MED001', 'Chronic Medication - Monthly Supply', 'medication', 1500, 400, false, false, 'none', 0, 0),
('MED002', 'Acute Medication - Course', 'medication', 450, 150, false, false, 'none', 0, 0),
('MED003', 'Pain Management - Injectable', 'medication', 2200, 550, false, false, 'none', 0, 0),

('PREG001', 'Pre-natal Consultation', 'maternity', 850, 250, false, true, 'none', 1, 0),
('PREG002', 'Ultrasound - Pregnancy', 'maternity', 1200, 300, false, false, 'none', 1, 0),
('PREG003', 'Post-natal Care Visit', 'maternity', 750, 200, false, false, 'none', 1, 0),
('NICU001', 'NICU - Per Day', 'maternity', 25000, 5000, true, true, 'none', 24, 0),

('DENT001', 'Tooth Extraction', 'dental', 1200, 300, false, true, 'none', 1, 3),
('DENT002', 'Root Canal Treatment', 'dental', 4500, 1200, false, true, 'pre_auth', 2, 5),
('DENT003', 'Dental Crown', 'dental', 6000, 1500, false, true, 'pre_auth', 2, 7),

('EYE001', 'Eye Examination - Comprehensive', 'optical', 850, 250, false, true, 'none', 1, 0),
('EYE002', 'Glasses - Standard Prescription', 'optical', 2500, 800, false, false, 'none', 0, 0),
('EYE003', 'Contact Lenses - Annual Supply', 'optical', 3500, 1200, false, false, 'none', 0, 0)

ON CONFLICT (procedure_code) DO NOTHING;

-- ============================================================================
-- Functions: Calculate simulation results
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_simulation_results(
  p_package_id INTEGER,
  p_procedures JSONB,
  p_network_compliant BOOLEAN DEFAULT true,
  p_pre_auth_obtained BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  v_total_cost DECIMAL(10,2) := 0;
  v_covered_amount DECIMAL(10,2) := 0;
  v_procedure JSONB;
  v_procedure_id INTEGER;
  v_quantity INTEGER;
  v_cost DECIMAL(10,2);
  v_coverage_pct DECIMAL(5,2);
  v_co_payment DECIMAL(10,2);
  v_result JSONB;
BEGIN
  -- Loop through each procedure
  FOR v_procedure IN SELECT * FROM jsonb_array_elements(p_procedures)
  LOOP
    v_procedure_id := (v_procedure->>'procedure_id')::INTEGER;
    v_quantity := COALESCE((v_procedure->>'quantity')::INTEGER, 1);
    
    -- Get procedure cost
    SELECT average_cost_private INTO v_cost
    FROM medical_procedures
    WHERE id = v_procedure_id;
    
    v_total_cost := v_total_cost + (v_cost * v_quantity);
    
    -- Get coverage rules
    SELECT 
      COALESCE(coverage_percentage, 0),
      COALESCE(co_payment_amount, 0)
    INTO v_coverage_pct, v_co_payment
    FROM coverage_rules
    WHERE package_id = p_package_id
    AND procedure_id = v_procedure_id;
    
    -- Apply network penalty if applicable
    IF NOT p_network_compliant THEN
      v_coverage_pct := v_coverage_pct * 0.70; -- 30% reduction for out-of-network
    END IF;
    
    -- Calculate covered amount
    v_covered_amount := v_covered_amount + 
      ((v_cost * v_quantity * v_coverage_pct / 100) - v_co_payment);
  END LOOP;
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'total_cost', v_total_cost,
    'covered_amount', GREATEST(v_covered_amount, 0),
    'out_of_pocket', v_total_cost - GREATEST(v_covered_amount, 0),
    'coverage_percentage', CASE WHEN v_total_cost > 0 
      THEN ROUND((GREATEST(v_covered_amount, 0) / v_total_cost * 100)::numeric, 2)
      ELSE 0 
    END
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers: Update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incident_types_timestamp BEFORE UPDATE ON incident_types
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_medical_procedures_timestamp BEFORE UPDATE ON medical_procedures
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_coverage_rules_timestamp BEFORE UPDATE ON coverage_rules
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_simulation_scenarios_timestamp BEFORE UPDATE ON simulation_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_claims_history_timestamp BEFORE UPDATE ON claims_history
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_procedure_guidelines_timestamp BEFORE UPDATE ON procedure_guidelines
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE incident_types IS 'Categorizes different types of medical incidents for simulation';
COMMENT ON TABLE medical_procedures IS 'Comprehensive database of medical procedures with costs and ICD-10 codes';
COMMENT ON TABLE coverage_rules IS 'Package-specific coverage rules for each procedure';
COMMENT ON TABLE simulation_scenarios IS 'User-created what-if scenarios with prediction results';
COMMENT ON TABLE claims_history IS 'Historical claims data for ML model training (anonymized)';
COMMENT ON TABLE procedure_guidelines IS 'Step-by-step action guides for specific incidents and packages';

COMMENT ON FUNCTION calculate_simulation_results IS 'Calculates total cost, covered amount, and out-of-pocket for a simulation scenario';
